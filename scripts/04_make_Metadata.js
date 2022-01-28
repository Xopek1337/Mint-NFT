const { default: axios } = require("axios");
const fs = require("fs");
require("dotenv").config();

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
    for(id = 100; id < 106; id++)
    {
        const res = await axios.get(process.env.OLD_METADATA_URL + id);
        if(!isEmpty(res.data)){
            res.data.image = process.env.NEW_METADATA_URL + id + ".svg";
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