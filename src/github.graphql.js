// READ FILE
// query {
//     repository(owner: "FantasticFiasco", name: "action-update-license-year-push-trigger") {
//       object(expression: "master:LICENSE") {
//         ... on  Blob{
//           text
//         }
//       }
//     }
//   }
// {
//   "data": {
//     "repository": {
//       "object": {
//         "text": "The content of the file"
//       }
//     }
//   }
// }
//
// query {
//     repository(owner: "FantasticFiasco", name: "action-update-license-year-push-trigger") {
//       object(expression: "master:LICENSEXXX") {
//         ... on  Blob{
//           text
//         }
//       }
//     }
//   }
// {
//   "data": {
//     "repository": {
//       "object": null
//     }
//   }
// }

// WRITE FILE
