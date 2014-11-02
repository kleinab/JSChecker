/*
 * reqs is a list of types (for example, ForStatement, VariableDeclaration, FunctionDeclaration) which must be found in the ast.
 */
var whitelist = function(ast, reqs) {
  var checkDone = function(reqsCopy) {
    return reqsCopy.length == 0;
  };
  var reqsCopy = dfs(ast, reqs, checkDone);
  if (checkDone(reqsCopy)) {
    console.log("You did it!");
  }
  else {
    console.log("You're missing "+reqsCopy);
  }
};

/*
 * reqs is a list of types (for example, ForStatement, VariableDeclaration, FunctionDeclaration) which must NOT be found in the ast.
 */
var blacklist = function(ast, reqs) {
  var checkDone = function(reqsCopy) {
    return false;
  };
  var reqsCopy = dfs(ast, reqs, checkDone);
  if (reqsCopy.length == reqs.length) {
    console.log("You did it!");
  }
  else {
    var diff = [];
    for (var i=0; i<reqs.length; i++) {
      if (reqsCopy.indexOf(reqs[i]) == -1) {
        diff.push(reqs[i]);
      } 
    }
    console.log("You have "+diff);
  }
};

var structure = function(ast, reqs) {

};

var dfs = function(astBranch, reqs, checkDone) {
  var reqsCopy = reqs.slice(0);

  // Check the type of our branch
  var typeIndex = reqsCopy.indexOf(astBranch.type);
  if (typeIndex != -1) {
    reqsCopy.splice(typeIndex, 1);
    if (checkDone(reqsCopy)) {
      return reqsCopy;
    }
  }

  // If this is not a leaf, then astBranch will have a "body" attribute. Explore all of these.
  if (astBranch.body) {
    if (astBranch.body.length) { // List of children
      for (i=0; i<astBranch.body.length; i++) {
        reqsCopy = dfs(astBranch.body[i], reqsCopy, checkDone);
        if (checkDone(reqsCopy)) {
          return reqsCopy;
        }
      }
    }
    else { // Child is a dictionary
      reqsCopy = dfs(astBranch.body.body, reqsCopy, checkDone);
      if (checkDone(reqsCopy)) {
        return reqsCopy;
      }
    }
  }
  return reqsCopy;
}