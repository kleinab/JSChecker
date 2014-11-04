/*
* Requires:
** ast is an AST object produced by esprima.parse()
** reqs is a list of type names (for example, ["ForStatement", "VariableDeclaration", "FunctionDeclaration"]) which must be found in the ast. Importantly, reqs cannot repeat types. For example ["ForStatement", "ForStatement"] is not allowed.
*/
var whitelist = function(ast, reqs) {
  /*
  * If matches is empty, then all of the requirements were found in the ast, so return true.
  */
  var checkDone = function(matches) {
    return matches.length == 0;
  };

  /*
  * matches starts off as a copy of reqs. When we find a branch whose type is in reqs, remove it from the list of matches and return the new list.
  */
  var checkMatch = function(reqs, matches, type) {
    if (reqs.indexOf(type) != -1) {
      var typeIndex = matches.indexOf(type);
      var matchesCopy = matches.slice(0);
      matchesCopy.splice(typeIndex, 1);
      return {"reqs": reqs, "matches": matchesCopy};
    }
    return {"reqs": reqs, "matches": matches};
  };

  var matches = reqs.slice(0);
  matches = dfs(ast, reqs, matches, checkMatch, checkDone);
  if (checkDone(matches)) {
    console.log("You did it!");
  }
  else {
    console.log("You're missing "+matches);
  }
};

/*
* Requires:
** ast is an AST object produced by esprima.parse()
** reqs is a list of type names (for example, ["ForStatement", "VariableDeclaration", "FunctionDeclaration"]) which must NOT be found in the ast. Importantly, reqs cannot repeat types. For example ["ForStatement", "ForStatement"] is not allowed.
*/
var blacklist = function(ast, reqs) {
  /*
  * If matches is the same length as reqs, then all of the blacklisted requirements were found in the ast, so return true.
  */
  var checkDone = function(matches) {
    return matches.length == reqs.length;
  };

  /*
  * matches starts off as an empty list. When we find a branch whose type is in reqs, add it to the list of matches and return the new list.
  */
  var checkMatch = function(reqs, matches, type) {
    if (reqs.indexOf(type) != -1) {
      var matchesCopy = matches.slice(0);
      matchesCopy.push(type);
      return {"reqs": reqs, "matches": matchesCopy};
    }
    return {"reqs": reqs, "matches": matches};
  };

  var matches = [];
  matches = dfs(ast, reqs, matches, checkMatch, checkDone);
  if (matches.length == 0) {
    console.log("You did it!");
  }
  else {
    console.log("You have "+matches);
  }
};


/*
* Requires:
** ast is an AST object produced by esprima.parse()
** reqs is a dictionary of lists of types which must be found in the ast. For example:
{"type": "FunctionDeclaration",
 "body": {"type": "ReturnStatement"}
}
*/
var structure = function(ast, reqs) {
  /*
  * If matches is empty, then the structure of this layer of the ast matches the required structure, so return true.
  */
  var checkDone = function(matches) {
    var empty = true;
    if (matches.length) {
      for (var i=0; i<matches.length; i++) {
        empty = empty && checkDone(matches[i]);
      }
      return empty
    }
    else {
      return $.isEmptyObject(matches);
    }
  };

  /*
  * matches starts off as a copy of reqs. As we change the layer of the ast we examine, we also change the layer of reqs. When we find a leaf, we remove it from matches.
  */
  var checkMatch = function(reqs, matches, type) {
    if (reqs.length) { // reqs is a list of nodes
      var reqsCopy = [];
      var matchesCopy = [];
      for (var i=0; i<reqs.length; i++) {
        var result = checkMatch(reqs[i], matches[i], type);
        reqsCopy[i] = result.reqs;
        matchesCopy[i] = result.matches;
      }
      return {"reqs": reqsCopy, "matches": matchesCopy}
    }
    else if (reqs.type == type) {
      if (reqs.body) { // Change the layer of reqs and matches as we dfs down the ast
        return {"reqs": reqs.body, "matches": matches.body};
      }
      else { // We are at a leaf
        return {"reqs": reqs, "matches": {}};
      }
    }
    else {
      return {"reqs": reqs, "matches": matches};
    }
  };

  var matches = $.extend(true, {}, reqs);
  matches = dfs(ast, reqs, matches, checkMatch, checkDone);
  if (checkDone(matches)) {
    console.log("You did it!");
  }
  else {
    console.log(matches);
  }
};

/*
* dfs performs a depth first search on the ast.
* Requires:
** astBranch is a node within the ast. It must be a dictionary with one attribute "type".
** reqs is a list of requirements the ast must have.
** matches is a list of types. It has a different purpose for whitelist, blacklist, and structure.
** checkMatch is a function which checks whether we have reached a branch whose type is found in reqs. If so, it returns an updated matches.
** checkDone is a function which checks whether dfs can terminate. It must return true or false.
*/
var dfs = function(astBranch, reqs, matches, checkMatch, checkDone) {
  // Check the whether the type of our branch is in reqs
  var result = checkMatch(reqs, matches, astBranch.type);
  var reqsCopy = result.reqs;
  var matchesCopy = result.matches;
  if (checkDone(matchesCopy)) {
    return matchesCopy;
  }

  // If this is not a leaf, then astBranch will have a "body" attribute. Explore all of these.
  if (astBranch.body) {
    if (astBranch.body.length) { // List of children
      for (var i=0; i<astBranch.body.length; i++) {
        matchesCopy = dfs(astBranch.body[i], reqsCopy, matchesCopy, checkMatch, checkDone);
        if (checkDone(matchesCopy)) {
          return matchesCopy;
        }
      }
    }
    else { // Child is a dictionary
      matchesCopy = dfs(astBranch.body, reqsCopy, matchesCopy, checkMatch, checkDone);
      if (checkDone(matchesCopy)) {
        return matchesCopy;
      }
    }
  }
  return matchesCopy;
}