//AsyncHandler is a wrapper that we can resue in the rest of the code to hadnle async await try catch functions

const asynhandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}

export { asynchandler }





//SECOND METHOD: 

//const asynchandler = () => {}
//const asynchandler = (func) => () => {}
//const asynchandler = (func) => async() => {}

// const asynchandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next)
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }