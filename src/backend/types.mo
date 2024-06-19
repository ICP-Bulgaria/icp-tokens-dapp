import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Bool "mo:base/Bool";
import List "mo:base/List";
import Nat "mo:base/Nat";

module {
    // Base
    public type HashMap<K, V> = HashMap.HashMap<K, V>;
    public type TrieMap<K, V> = TrieMap.TrieMap<K, V>;
    public type List<T> = List.List<T>;

    // User core
    public type User = {
        id : Principal;
        twitterAcc : Text;
        createdAt: ?Int;
    };
    public type UsersList = HashMap<Principal, User>;

    // Portfolio
    public type Transaction = {
        id: Nat;
        canister_id: Text;
        quantity: Float;
        price_per_token: Float;
        timestamp: Int;
        note: Text;
        direction: Bool;
    };
    public type Portfolio = {
        name: Text;
        transactions: [Transaction]; // Store transactions in a List
    };

    public type PortfoliosList = HashMap<Principal, [Portfolio]>;

    // Watchlist
    public type WatchlistId = Text;
    public type Watchlist = HashMap<Principal, [WatchlistId]>;

    // Comments
    public type Comment = {
        id: Nat;
        text: Text;
        timestamp: Int;
        user_principal: Principal;
    };

    public type CommentList = HashMap<Principal, [Comment]>;
}