import Principal "mo:base/Principal";
import Types "types";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Buffer "mo:base/Buffer";
import Bool "mo:base/Bool";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor Core {
  stable var usersRepository : [(Principal, Types.User)] = [];
  stable var portfoliosRepository : [(Principal, [Types.Portfolio])] = [];
  stable var watchlistRepository : [(Principal, [Types.WatchlistId])] = [];

  stable var nextTransactionId = 1;

  let users : Types.UsersList = HashMap.fromIter<Principal, Types.User>(usersRepository.vals(), 10, Principal.equal, Principal.hash);
  let portfolios : Types.PortfoliosList = HashMap.fromIter<Principal, [Types.Portfolio]>(portfoliosRepository.vals(), 10, Principal.equal, Principal.hash);
  let watchlist : Types.Watchlist = HashMap.fromIter<Principal, [Types.WatchlistId]>(watchlistRepository.vals(), 10, Principal.equal, Principal.hash);

  // User core logic
  public query func getAllUsers() : async [Types.User] {
    let entries = users.entries();
    let memberIter : Iter.Iter<Types.User> = {
      next = func () : ?Types.User {
        switch (entries.next()) {
          case (?(_, member)) { return ?member; };
          case null { return null; };
        };
      };
    };

    return Iter.toArray<Types.User>(memberIter);
  };

  public shared (msg) func createUser() : async ?Types.User {
    let userResult = users.get(msg.caller);

    if(Principal.equal(msg.caller, Principal.fromText("2vxsx-fae")) == false or true) {
      switch(userResult) {
        case(null) {
          let data = {
            id = msg.caller;
            twitterAcc = "";
            createdAt = ?Time.now();
          };

          users.put(msg.caller, data);  

          return ?data;
        };
        case(?user) {
        };
      };
    };

    return userResult;
  };

  public shared query (msg) func getCurrentUser() : async ?Types.User {
    let userResult = users.get(msg.caller);

    return userResult;
  };
  
  public shared ({ caller }) func whoami() : async Principal {
    caller;
  };

  public shared query (msg) func getPortfolios() : async ?[Types.Portfolio] {
    let portfoliosResult = portfolios.get(msg.caller);

    return portfoliosResult;
  };

  // Portfolio
  public shared (msg) func createPortfolio(name : Text) : async ?Types.Portfolio {
    let portfoliosResult = portfolios.get(msg.caller);
    let portfolio : Types.Portfolio = {
      name = name;
      transactions = [];
    };          

    switch (portfoliosResult) {
      case (null) {
        portfolios.put(msg.caller, [portfolio]);
      };
      case (?value) {
        if(value.size() >= 3) {
          return null;
        };

        let list = Buffer.fromArray<Types.Portfolio>(value);

        list.add(portfolio);

        portfolios.put(msg.caller, Buffer.toArray(list));
      };
    };

    return ?portfolio;
  };

  public shared (msg) func deletePortfolio(index : Nat) : async Bool {
    let portfoliosResult = portfolios.get(msg.caller);

    switch(portfoliosResult) {
      case(null) {};
      case(?value) {
        let list = Buffer.fromArray<Types.Portfolio>(value);

        if(index >= 0 and index < list.size()) {
          let remove = list.remove(index);

          portfolios.put(msg.caller, Buffer.toArray(list));

          return true;
        };
      };
    };

    return false;
  };

  public shared (msg) func addPortfolioTransaction(portfolioIndex : Nat, transaction : Types.Transaction) : async ?Types.Transaction {
      // Retrieve the list of portfolios for the caller
      let portfoliosResult = portfolios.get(msg.caller);
      
      switch(portfoliosResult) {
          case (null) {
              // No portfolios found for the user
              return null;
          };
          case (?portfoliosList) {
              if (portfolioIndex < 0 or portfolioIndex >= Array.size(portfoliosList)) {
                  // Portfolio index out of range
                  return null;
              };

              let portfolio = portfoliosList[portfolioIndex];

              let newTransaction : Types.Transaction = {
                id = nextTransactionId;
                canister_id = transaction.canister_id;
                quantity = transaction.quantity;
                price_per_token = transaction.price_per_token;
                timestamp = transaction.timestamp;
                note = transaction.note;
                direction = transaction.direction;
              };

              let updatedTransactions = List.push<Types.Transaction>(newTransaction, List.fromArray(portfolio.transactions));
              let updatedData = Buffer.Buffer<Types.Portfolio>(Array.size(portfoliosList));
              
              for(i in portfoliosList.keys()) {
                if(i == portfolioIndex) {
                  updatedData.add({
                    name = portfoliosList[i].name;
                    transactions = List.toArray(updatedTransactions);
                  });
                } else {
                  updatedData.add(portfoliosList[i]);
                };
              };
              
              // Save the updated list of portfolios back to the hashmap
              portfolios.put(msg.caller, Buffer.toArray(updatedData));

              nextTransactionId := Nat.add(nextTransactionId, 1);
              
              return ?newTransaction;
          };
      };
  };

  public shared (msg) func removePortfolioTransaction(portfolioIndex : Nat, transactionIndex : Nat) : async Bool {
      // Retrieve the list of portfolios for the caller
      let portfoliosResult = portfolios.get(msg.caller);
      
      switch(portfoliosResult) {
          case (null) {
              // No portfolios found for the user
              return false;
          };
          case (?portfoliosList) {
              if (portfolioIndex < 0 or portfolioIndex >= Array.size(portfoliosList)) {
                  // Portfolio index out of range
                  return false;
              };
              
              let portfolio = portfoliosList[portfolioIndex];
              
              if (transactionIndex <= 0 or transactionIndex >= nextTransactionId) {
                  // Transaction index out of range
                  return false;
              };
              
              // Remove the transaction from the list and capture the removed transaction if needed
              let buffer = Buffer.fromIter<Types.Transaction>(Iter.fromArray(portfolio.transactions));

              var bufferId = 0;
              var isTransactionRemoved : Bool = false;

              Buffer.iterate<Types.Transaction>(buffer, func(x) {
                if(x.id == transactionIndex) {
                  let remove = buffer.remove(bufferId);
                  isTransactionRemoved := true;
                };
                bufferId := bufferId + 1;
              });

              let updatedTransactions = Buffer.toArray(buffer);
              let updatedData = Buffer.Buffer<Types.Portfolio>(Array.size(portfoliosList));
              
              for(i in portfoliosList.keys()) {
                if(i == portfolioIndex) {
                  updatedData.add({
                    name = portfoliosList[i].name;
                    transactions = updatedTransactions;
                  });
                } else {
                  updatedData.add(portfoliosList[i]);
                };
              };
              
              // Save the updated list of portfolios back to the hashmap
              portfolios.put(msg.caller, Buffer.toArray(updatedData));
              
              return isTransactionRemoved;
          };
      };
  };

  public shared (msg) func editPortfolioTransaction(portfolioIndex : Nat, transactionIndex : Nat, newTransaction : Types.Transaction) : async ?Types.Transaction {
      // Retrieve the list of portfolios for the caller
      let portfoliosResult = portfolios.get(msg.caller);

      switch (portfoliosResult) {
          case (null) {
              // No portfolios found for the user
              return null;
          };
          case (?portfoliosList) {
              if (portfolioIndex < 0 or portfolioIndex >= Array.size(portfoliosList)) {
                  // Portfolio index out of range
                  return null;
              };

              let portfolio = portfoliosList[portfolioIndex];

              if (transactionIndex < 0 or transactionIndex >= Array.size(portfolio.transactions)) {
                  // Transaction index out of range
                  return null;
              };

              // Create a buffer from the list of transactions
              let buffer = Buffer.fromIter<Types.Transaction>(Iter.fromArray(portfolio.transactions));

              // Replace the old transaction with the new one
              let remove = buffer.remove(transactionIndex);
              buffer.add(newTransaction);

              let updatedTransactions = Buffer.toArray(buffer);

              // Construct the updated portfolios array to save changes
              let updatedData = Buffer.Buffer<Types.Portfolio>(Array.size(portfoliosList));

              for (i in portfoliosList.keys()) {
                  if (i == portfolioIndex) {
                      updatedData.add({
                          name = portfoliosList[i].name;
                          transactions = updatedTransactions;
                      });
                  } else {
                      updatedData.add(portfoliosList[i]);
                  };
              };

              // Save the updated list of portfolios back to the hashmap
              portfolios.put(msg.caller, Buffer.toArray(updatedData));

              return ?newTransaction;
          };
      };
  };

  //Watchlist
  public shared query (msg) func getWatchlist() : async ?[Types.WatchlistId] {
      // Retrieve the watchlist for the caller
      let watchlistResult = watchlist.get(msg.caller);
      
      switch (watchlistResult) {
          case (null) {
              // No watchlist found for the user
              return null;
          };
          case (?userWatchlist) {
              // Return the user's watchlist
              return ?userWatchlist;
          };
      };
  };

  public shared (msg) func updateWatchlist(newWatchlist : [Types.WatchlistId]) : async [Types.WatchlistId] {
      // Check if the user has a watchlist to update
      let existingWatchlist = watchlist.get(msg.caller);

      switch (existingWatchlist) {
          case (null) {
              // No existing watchlist found, create a new one
              watchlist.put(msg.caller, newWatchlist);
          };
          case (?_) {
              // Update the existing watchlist with the new data
              watchlist.put(msg.caller, newWatchlist);
          };
      };

      return newWatchlist;
  };

  // Actions before upgrade the canister
  system func preupgrade() {
    usersRepository := Iter.toArray(users.entries());
    portfoliosRepository := Iter.toArray(portfolios.entries());
    watchlistRepository := Iter.toArray(watchlist.entries());
  };

  // Actions after canister upgrade
  system func postupgrade() {
    usersRepository := [];
    portfoliosRepository := [];
    watchlistRepository := [];
  };
}