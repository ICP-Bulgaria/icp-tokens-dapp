import Types "../types";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

actor Comments {
  stable var commentsRepository : [(Principal, [Types.Comment])] = [];

  let comments : Types.CommentList = HashMap.fromIter<Principal, [Types.Comment]>(commentsRepository.vals(), 10, Principal.equal, Principal.hash);
  var commentIdentifier : Nat = 1;

  // Comments
  public shared (msg) func addComment(tokenId : Principal, text : Text, timestamp : Int) : async ?Types.Comment {
    // Retrieve the list of comments for the caller
    let commentsResult = comments.get(tokenId);

    var comment = {
      id = commentIdentifier;
      text = text;
      timestamp = timestamp;
      user_principal = msg.caller;
    };
    commentIdentifier += 1;

    switch (commentsResult) {
      case (null) {
        // No comments found for the user
        comments.put(tokenId, [comment]);
      };
      case (?tokenComments) {
        // Add the new comment to the existing list
        let updatedComments = List.push<Types.Comment>(comment, List.fromArray(tokenComments));
        comments.put(tokenId, List.toArray(updatedComments));
      };
    };

    return ?comment;
  };

  public shared func deleteComment(tokenId : Principal, commentId : Nat) : async Bool {
    // Retrieve the list of comments for the caller
    let commentsResult = comments.get(tokenId);

    switch (commentsResult) {
      case (null) {
        // No comments found for the user
        return false;
      };
      case (?tokenComments) {
        let updatedComments = List.filter<Types.Comment>(List.fromArray(tokenComments), func c { c.id != commentId });

        comments.put(tokenId, List.toArray(updatedComments));
        return true;
      };
    };
  };

  public shared func getComments(tokenId : Principal) : async [Types.Comment] {
    // Retrieve the list of comments for the caller
    let commentsResult = comments.get(tokenId);

    switch (commentsResult) {
      case (null) {
        // No comments found for the token
        return [];
      };
      case (?tokenComments) {
        return tokenComments;
      };
    };
  };

  // Actions before upgrade the canister
  system func preupgrade() {
    commentsRepository := Iter.toArray(comments.entries());
  };

  // Actions after canister upgrade
  system func postupgrade() {
    commentsRepository := [];
  };
};
