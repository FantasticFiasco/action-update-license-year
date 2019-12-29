const core = require("@actions/core");
const license = require("./license");

try {
    license.update();
}
catch (err) {
    core.setFailed(`Action failed with error: ${err}`);
}
