const { default: axios } = require("axios");
const fs = require("fs");

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

async function main() {
    const dir = "./Metadata/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    for(id = 100; id<106; id++)
    {
        const res = await axios.get("https://api.cryptobots.me/api/token/"+id);
        if(!isEmpty(res.data)){
            res.data.image = "https://ipfs.io/ipfs/QmYRjS8rQUSpoEuc8vL5rPQ9c6e8ky6JxoZfSH56h2QV7H/" + id + ".svg";
            const fileName = id + `.json`;
            console.log(res.data.image);
            const data = await JSON.stringify(res.data, null, 2);
            
            await fs.writeFileSync(dir + fileName, data, { encoding: "utf8" });
        }
    }                                               
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });