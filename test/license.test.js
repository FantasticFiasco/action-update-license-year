const fs = require("fs");
const license = require("../src/license");

test("updates Apache 2.0 license from a single year into a range of years", () => {
    fs.copyFileSync("./test/APACHE_2_0_SINGLE_BEFORE", "./test/LICENSE")
    const got = license.updateFile("./test/LICENSE", 1001);
    const want = readFile("./test/APACHE_2_0_SINGLE_AFTER");
    expect(got).toBe(want);
});

test("updates Apache 2.0 license from a range of years into a new range of years", () => {
    fs.copyFileSync("./test/APACHE_2_0_RANGE_BEFORE", "./test/LICENSE")
    const got = license.updateFile("./test/LICENSE", 2001);
    const want = readFile("./test/APACHE_2_0_RANGE_AFTER");
    expect(got).toBe(want);
});

function readFile(fileName) {
    return fs.readFileSync(fileName).toString();
}
