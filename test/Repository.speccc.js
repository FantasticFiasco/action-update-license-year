// jest.mock('@actions/core', () => ({
//     getInput: jest.fn().mockReturnValue('some token'),
//     setFailed: jest.fn(),
// }));

// jest.mock('@actions/github', () => ({
//     context: {
//         repo: {
//             owner: 'FantasticFiasco',
//             repo: 'action-update-license-year',
//         },
//     },
//     getOctokit: jest.fn().mockReturnValue({
//         git: {
//             createRef: jest.fn(),
//             getRef: jest.fn(),
//         },
//         repos: {
//             getContent: jest.fn(),
//             createOrUpdateFileContents: jest.fn(),
//         },
//         pulls: {
//             list: jest.fn(),
//             create: jest.fn(),
//         },
//     }),
// }));

// jest.mock('../src/license', () => ({
//     updateLicense: jest.fn(),
// }));

// const res = {
//     git: {
//         getRef: {
//             success: Promise.resolve({
//                 status: 200,
//                 data: {
//                     object: {
//                         sha: 'some sha',
//                     },
//                 },
//             }),
//             failure: Promise.reject({
//                 status: 404,
//             }),
//         },
//         getContent: {
//             success: {
//                 data: {
//                     content: Buffer.from('some license').toString('base64'),
//                 },
//             },
//         },
//     },
//     pulls: {
//         list: {
//             notEmpty: {
//                 data: [],
//             },
//         },
//     },
// };
