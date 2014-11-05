/*
* Requires:
** ast is an AST object produced by esprima.parse()
** reqs is a list of type names (for example, ["ForStatement", "VariableDeclaration", "FunctionDeclaration"]) which must be found in the ast. Importantly, reqs cannot repeat types. For example ["ForStatement", "ForStatement"] is not allowed.
* Returns:
** List of requirements that are not present in the code. Empty list if all requirements are present in code.
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
  var updateMatches = function(reqs, matches, type) {
    if (reqs.indexOf(type) != -1) {
      var typeIndex = matches.indexOf(type);
      var matchesCopy = matches.slice(0);
      matchesCopy.splice(typeIndex, 1);
      return {"reqs": reqs, "matches": matchesCopy};
    }
    return {"reqs": reqs, "matches": matches};
  };

  var matches = reqs.slice(0);
  return dfs(ast, reqs, matches, updateMatches, checkDone);
};

/*
* Requires:
** ast is an AST object produced by esprima.parse()
** reqs is a list of type names (for example, ["ForStatement", "VariableDeclaration", "FunctionDeclaration"]) which must NOT be found in the ast. Importantly, reqs cannot repeat types. For example ["ForStatement", "ForStatement"] is not allowed.
* Returns:
** List of requirements that are present in the code. Empty list if none of the requirements are present in code.
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
  var updateMatches = function(reqs, matches, type) {
    if (reqs.indexOf(type) != -1) {
      var matchesCopy = matches.slice(0);
      matchesCopy.push(type);
      return {"reqs": reqs, "matches": matchesCopy};
    }
    return {"reqs": reqs, "matches": matches};
  };

  var matches = [];
  return dfs(ast, reqs, matches, updateMatches, checkDone);
};


/*
* Requires:
** ast is an AST object produced by esprima.parse()
** reqs is a dictionary of lists of types which must be found in the ast. For example:
{"type": "FunctionDeclaration",
 "body": {"type": "ReturnStatement"}
}
* Returns:
** List of structures that are not present in the code. Empty list if all structure elements are present in code.
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
  var updateMatches = function(reqs, matches, type) {
    if (reqs.length) { // reqs is a list of nodes
      var reqsCopy = [];
      var matchesCopy = [];
      for (var i=0; i<reqs.length; i++) {
        var result = updateMatches(reqs[i], matches[i], type);
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
  matches = dfs(ast, reqs, matches, updateMatches, checkDone);
  if (checkDone(matches)) {
    return [];
  }
  else {
    return matches;
  }
};

/*
* dfs performs a depth first search on the ast.
* Requires:
** node is a node within the ast. It must be a dictionary with one attribute "type". It optionally has an attribute "body", whose value is a single node or a list of nodes.
** reqs is a list of requirements the ast must have.
** matches is a list of types. It has a different purpose for whitelist, blacklist, and structure.
** updateMatches is a function which checks whether we have reached a branch whose type is found in reqs. If so, it returns an updated matches.
** checkDone is a function which checks whether dfs can terminate. It must return true or false.
* Returns:
** modified version of matches, according to the updateMatches function of the 
*/
var dfs = function(node, reqs, matches, updateMatches, checkDone) {
  // Check the whether the type of our branch is in reqs
  var result = updateMatches(reqs, matches, node.type);
  var reqsCopy = result.reqs;
  var matchesCopy = result.matches;
  if (checkDone(matchesCopy)) {
    return matchesCopy;
  }

  // If this is not a leaf, then node will have a "body" attribute. Explore all of these.
  if (node.body) {
    if (node.body.length) { // List of children
      for (var i=0; i<node.body.length; i++) {
        matchesCopy = dfs(node.body[i], reqsCopy, matchesCopy, updateMatches, checkDone);
        if (checkDone(matchesCopy)) {
          return matchesCopy;
        }
      }
    }
    else { // Child is a dictionary
      matchesCopy = dfs(node.body, reqsCopy, matchesCopy, updateMatches, checkDone);
      if (checkDone(matchesCopy)) {
        return matchesCopy;
      }
    }
  }
  return matchesCopy;
}