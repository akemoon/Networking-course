import { Floyd } from "../src/graph/Floyd";

const graph = {
  size: () => 7,
  getAdjacencyList: () => [
    [0,
     [{ to: 1, weight: 4 },
      { to: 3, weight: 3 },
      { to: 4, weight: 8 },
      { to: 5, weight: 4 }]
    ],
    [1, [{ to: 0, weight: 4 }]],
    [2, [{ to: 0, weight: 3 }]],
    [3,
     [{ to: 0, weight: 3 },
      { to: 4, weight: 2 }]
    ],
    [4, [{ to: 0, weight: 8 }]],
    [5, [{ to: 1, weight: -1 }]],
    [6, []],
  ],
};

const result = Floyd(graph);

for (const [from, other] of result) {
  console.log(from);
  for (const {to, path, weight} of other) {
    console.log(to, path, weight);
  }
}
