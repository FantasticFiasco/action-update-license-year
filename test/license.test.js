const fs = require("fs");
import { License } from "../src/license";

test("updates Apache 2.0 license from a single year into a range of years", () => {
    const got = new License().updateToYear(readTestFile("APACHE_2_0_SINGLE_BEFORE"), 1001);
    const want = readTestFile("APACHE_2_0_SINGLE_AFTER");
    expect(got).toBe(want);
});

test("updates Apache 2.0 license from a range of years into a new range of years", () => {
    const got = new License().updateToYear(readTestFile("APACHE_2_0_RANGE_BEFORE"), 2001);
    const want = readTestFile("APACHE_2_0_RANGE_AFTER");
    expect(got).toBe(want);
});

function readTestFile(fileName) {
    return fs.readFileSync(`./test/${fileName}`).toString();
}
