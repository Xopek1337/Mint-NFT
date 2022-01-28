const { soliditySha3 } = require("web3-utils");
const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256')

const fs = require("fs");

async function main() {
  var arr = [];
  const dir = "./tree/";
  const fileName = "01.json";
  const data = JSON.parse(await fs.readFileSync(dir + fileName, { encoding: "utf8" }));
  for(var k in data)
  {
    const soliditySha3Expected = soliditySha3(
        k, data[k]
    );
    arr.push(soliditySha3Expected);
  }
  const leaves = arr.map(x => SHA256(x))
  const tree = new MerkleTree(leaves, SHA256);

  console.log(tree.toString('hex'));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
