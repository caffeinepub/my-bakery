import Order "mo:core/Order";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Incorporate Authentication and Storage Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Methods
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Bakery core types
  type OpeningHour = {
    day : Text;
    hours : Text;
  };

  type BakerySettings = {
    heroHeadline : Text;
    heroSubheading : Text;
    heroCtaText : Text;
    aboutTitle : Text;
    aboutBody : Text;
    aboutImageId : ?Text;
    address : Text;
    phone : Text;
    email : Text;
    openingHours : [OpeningHour];
  };

  type MenuItem = {
    id : Text;
    name : Text;
    description : Text;
    price : Text;
    imageId : ?Storage.ExternalBlob;
    category : Text;
    isAvailable : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Order types
  public type OrderItem = {
    menuItemId : Text;
    name : Text;
    quantity : Nat;
    price : Text;
  };

  public type CustomerOrder = {
    id : Text;
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    items : [OrderItem];
    totalPrice : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  // Bakery State
  var nextMenuItemId = 1;
  let menuItemMap = Map.empty<Text, MenuItem>();
  var bakerySettings : BakerySettings = {
    heroHeadline = "Welcome to Our Bakery";
    heroSubheading = "Delicious treats made fresh daily";
    heroCtaText = "Order Now";
    aboutTitle = "About Us";
    aboutBody = "We are passionate about baking!";
    aboutImageId = null;
    address = "123 Main St, Anytown";
    phone = "555-1234";
    email = "info@bakery.com";
    openingHours = [];
  };

  // Order State
  var nextOrderId = 1;
  let orderMap = Map.empty<Text, CustomerOrder>();

  // Helper Functions
  func getNextMenuItemId() : Text {
    let id = nextMenuItemId.toText();
    nextMenuItemId += 1;
    id;
  };

  func getNextOrderId() : Text {
    let id = nextOrderId.toText();
    nextOrderId += 1;
    id;
  };

  func getMenuItemInternal(id : Text) : MenuItem {
    switch (menuItemMap.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) { item };
    };
  };

  // Bakery Settings Methods
  public shared ({ caller }) func updateBakerySettings(newSettings : BakerySettings) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    bakerySettings := newSettings;
  };

  public query ({ caller }) func getBakerySettings() : async BakerySettings {
    bakerySettings;
  };

  // Menu Item Methods
  public shared ({ caller }) func createMenuItem(newItem : MenuItem) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create menu items");
    };

    let id = getNextMenuItemId();
    let now = Time.now();
    let menuItem : MenuItem = {
      newItem with
      id;
      createdAt = now;
      updatedAt = now;
    };
    menuItemMap.add(id, menuItem);
    id;
  };

  public shared ({ caller }) func updateMenuItem(itemId : Text, updatedItem : MenuItem) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };

    let existingItem = getMenuItemInternal(itemId);
    let updated : MenuItem = {
      updatedItem with
      id = itemId;
      createdAt = existingItem.createdAt;
      updatedAt = Time.now();
    };
    menuItemMap.add(itemId, updated);
  };

  public shared ({ caller }) func deleteMenuItem(itemId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    if (not menuItemMap.containsKey(itemId)) { Runtime.trap("Menu item not found") };
    menuItemMap.remove(itemId);
  };

  public query ({ caller }) func getMenuItem(itemId : Text) : async MenuItem {
    getMenuItemInternal(itemId);
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    menuItemMap.values().toArray();
  };

  public query ({ caller }) func getAvailableMenuItems() : async [MenuItem] {
    let items = List.empty<MenuItem>();
    for (item in menuItemMap.values()) {
      if (item.isAvailable) {
        items.add(item);
      };
    };
    items.toArray();
  };

  // Order Methods
  public shared func placeOrder(order : CustomerOrder) : async Text {
    let id = getNextOrderId();
    let now = Time.now();
    let newOrder : CustomerOrder = {
      order with
      id;
      status = "new";
      createdAt = now;
    };
    orderMap.add(id, newOrder);
    id;
  };

  public query ({ caller }) func getAllOrders() : async [CustomerOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orderMap.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orderMap.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?existing) {
        let updated : CustomerOrder = { existing with status };
        orderMap.add(orderId, updated);
      };
    };
  };
};
