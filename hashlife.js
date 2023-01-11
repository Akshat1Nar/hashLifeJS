// Class to represent quadtree for a life grid
// based on classic algorithm - HashLife
// Compresses time and memory

// Class to contruct single node of a quad tree
class Node {
	
	// constructor
	constructor(k, a, b, c, d, n, hash) {

		// level of current node
		this.k = k;

		// a, b, c, d are children of current node
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;

		// number of cells present
		this.n = n;

		// hash value of current node
		this.hash = hash;
	}

	// print the current node appropriately
	printNode() {
		return `Node k=${this.k}, ${1<<this.k} X ${1<<this.k}, pop ${this.n}`;
	}

	// function to join 4 children
	static join(a, b, c, d) {
		
		// update number of cells
		n = a.n + b.n + c.n + d.n;

		// yet to implement
		nHash = 0n;

		// return node
		return Node(a.k+1, a, b, c, d, n, nHash);
	}
	
	// empty node at level k
	// used for padding
	static getZero(k) {

		// for level zero its just off node
		if (k == 0)
			return off;

		prevLevel = getZero(k-1);
		join(prevLevel, prevLevel, prevLevel, prevLevel);
	}

	// pad a node at level k for level k+1 with zeros
	static centre(node) {
		
		// get zero tree at level one below
		tmp = getZero(node.k - 1);

		// return padded
		return join(
			join(tmp, tmp, tmp, node.a), join(tmp, tmp, node.b, tmp),
			join(tmp, node.c, tmp, tmp), join(node.d, tmp, tmp, tmp)
		);
	}
			
}

// on and off cells constants
let on = new Node(0, null, null, null, null, 1, 1);
let off = new Node(0, null, null, null, null, 0, 0);

// simple life rule of a 3x3 square
// cells is 9 cells unpacked a an single array of 8 elements and center
function life(cells, centre) {
	
	// count of neighbours of central square
	neighbours = 0;
	for(let i=0; i < cells.length; i++ )
		neighbours += cells[i].n;

	if ((centre.n && outer == 2) || (outer == 3))
		return on;
	else
		return off;
}

// solve a 4x4 life
// remember you can only solve for central 2x2 square
function life_4x4(node) {

	// solve life for mid 2x2 matrix square by square
	ad = life([node.a.a, node.a.b, node.b.a, node.a.c, node.b.c, node.c.a, node.c.b, node.d.a], node.a.d); 	
	bc = life([node.a.b, node.b.a, node.b.b, node.a.d, node.b.d, node.c.b, node.d.a, node.d.b], node.b.c); 	
	cb = life([node.a.c, node.a.d, node.b.c, node.c.a, node.d.a, node.c.c, node.c.d, node.d.c], node.c.b); 	
	da = life([node.a.d, node.b.c, node.b.d, node.c.b, node.d.b, node.c.d, node.d.c, node.d.d], node.d.a); 	

	// join and return
	return Node.join(ab, bc, cb, da);
}

// main hashlife algorithm to find the successor
// j -> 2**j generations in the future
function successor(node, j=null) {
	
	// if no cells
	if (node.n == 0)
		return node.a;

	// 4x4 life
	if (node.k == 2)
		return life_4x4(node);
	
	if (j==null)
		j = (node.k - 2);
	else
		j = min(j, node.k - 2);
	
	c1 = successor(Node.join(node.a.a, node.a.b, node.a.c, node.a.d), j);
	c2 = successor(Node.join(node.a.b, node.b.a, node.a.d, node.b.c), j);
	c3 = successor(Node.join(node.b.a, node.b.b, node.b.c, node.b.d), j);
	c4 = successor(Node.join(node.a.c, node.a.d, node.c.a, node.c.b), j);
	c5 = successor(Node.join(node.a.d, node.b.c, node.c.b, node.d.a), j);
	c6 = successor(Node.join(node.b.c, node.b.d, node.d.a, node.d.b), j);
	c7 = successor(Node.join(node.c.a, node.c.b, node.c.c, node.c.d), j);
	c8 = successor(Node.join(node.c.b, node.d.a, node.c.d, node.d.c), j);
	c9 = successor(Node.join(node.d.a, node.d.b, node.d.c, node.d.d), j);

	if (j< node.k-2)
		return Node.join(
			(Node.join(c1.d, c2.c, c4.b, c5.a)),
			(Node.join(c2.d, c3.c, c5.b, c6.a)),
			(Node.join(c4.d, c5.c, c7.b, c8.a)),
			(Node.join(c5.d, c6.c, c8.b, c9.a))
		)
	
	return join(
		successor(Node.join(c1, c2, c4, c5), j),
		successor(Node.join(c2, c3, c5, c6), j),
		successor(Node.join(c4, c5, c7, c8), j),
		successor(Node.join(c5, c6, c8, c9), j),
	)
}

// find nth successor of a given node
function advance(node, n) {
	
	// no advance in time
	if (n == 0)
		return node;
	
	let bits = [];

	while (n>0) {
		bits.push(n&1);
		n = n>>1;

		// pad zeros
		node = Node.centre(node);
	}

	// since we advance in powers of two
	// we can use binary expression of n
	// to advance
	for(let i=bits.length-1; i>=0; i--) {
		let j = bits.length - i - 1;
		if (bits[i] != 0)
			node = successor(node, j);
	}
	
	return node;
}

// To jump forward quickly use this
function ffwd(node, n) {

	// no idea about this one
	for(let i = 0; i<n; i++) {
		while (node.k < 3 || node.a.n != node.a.d.d.n ||
			node.b.n != node.b.c.c.n ||
			node.c.n != node.c.b.b.n ||
			node.d.n != node.d.a.a.n) { 
			node = Node.centre(node);
				node = successor(node);
		}
	}
	return node;
}

// function to turn a quadtree into (x, y, gray) triples
// based on their level they are given grayscale values from 0-1
function expand(node, x=0, y=0, clip=null, level=0) {

	if (node.n == 0)
		// return empty array
		return [];
	
	size = 2**node.k;

	if (clip!=null) {
		if (x+size < clip[0] || x > clip[1] ||
		    y+size < clip[2] || y > clip[3])
		    return [];
	}

	if (node.k == level) {
		// base case
		gray = node.n / (size ** 2);
		return [[x>>level, y>>level, gray]];
	}

	offset = size >> 1;
	return (
		expand(node.a, x, y, clip, level)
		+ expand(node.b, x + offset, y, clip, level)
		+ expand(node.c, x, y + offset, clip, level)
		+ expand(node.b, x + offset, y + offset, clip, level)
	);
}

// turn list of [x, y] coordinates into a quadtree
function construct(pts) {

	// shift origin to (0, 0)
	min_x = pts[0][0];
	min_y = pts[0][1];

	// find minimum first
	for (let i = 0; i < pts.length; i++) {
		min_x = min_x>pts[i][0]? pts[i][0] : min_x;
		min_y = min_y>pts[i][1]? pts[i][1] : min_y;
	}
	
	// shift origin
	for (let i = 0; i < pts.length; i++) {
		pts[i][0] -= min_x;
		pts[i][1] -= min_y;
	}

	k = 0;

	while (pattern.length != -1) {
		// contruct bottom up
	}	
}
