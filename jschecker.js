/*
 * reqs is a list of types (for example, ForStatement, VariableDeclaration, FunctionDeclaration) which must be found in the ast.
 */
var whitelist = function(ast, reqs) {
  var reqs_copy = dfs(ast, reqs);
  if (reqs_copy.length == 0) {
    console.log("You did it!");
  }
  else {
    console.log("You're missing "+reqs_copy);
  }
}

var blacklist = function(reqs) {

}

var structure = function(reqs) {

}

var checkDone = function(reqs) {
  return reqs.length == 0;
}

var dfs = function(ast_branch, reqs) {
  var reqs_copy = reqs.slice(0);

  // Check the type of our branch
  var type_index = reqs_copy.indexOf(ast_branch.type);
  if (type_index > -1) {
    reqs_copy.splice(type_index, 1);
    if (checkDone(reqs_copy)) {
      return reqs_copy;
    }
  }

  // If this is not a leaf, then ast_branch will have a "body" attribute. Explore all of these.
  if (ast_branch.body) {
    if (ast_branch.body.length) { // List of children
      for (i=0; i<ast_branch.body.length; i++) {
        reqs_copy = dfs(ast_branch.body[i], reqs_copy);
        if (checkDone(reqs_copy)) {
          return reqs_copy;
        }
      }
    }
    else { // Child is a dictionary
      reqs_copy = dfs(ast_branch.body, reqs_copy);
      if (checkDone(reqs_copy)) {
        return reqs_copy;
      }
    }
  }
  return reqs_copy;
}