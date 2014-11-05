JSChecker
=========

Esprima vs. Acorn:
---------
I decided to choose esprima as my js parser. I tried the performance test on esprima's website (http://esprima.org/test/compare.html) and esprima performed slightly better than acorn.
Additionally, its documentation is more user friendly than acorn's. Acorn displays its entire code base and documents every line. While this is useful to see how short the document is, it's too much information. Esprima's documentation is much easier to "parse" (haha).
Also, acorn does not provide any examples, while esprima provides several. Finally, esprima describes the form of its output, while acorn does not. Presumably they are the same output, but it would be great to know this ahead of time before running the code.

Testing the API:
---------
Change the variables whitelistReqs, blacklistReqs, and structureReqs.

whitelistReqs and blacklistReqs must take the form of a list of types, with the same official names that the esprima parser uses to identify types (for example, VariableDeclaration, FunctionDeclaration, ForStatement, BlockStatement, ReturnStatement).

structureReqs must take the form of a modified esprima ast. Every node is of the form {"type": typeName} and has an optional attribute "body", which may have a single node or a list of nodes as its value.
