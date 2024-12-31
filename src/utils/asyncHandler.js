//const asyncHandler = () => {}


export {asyncHandler}

// ye hamara higher order function hota h means jo dusre functions ko accept krta h and then unko aage pass krta h


const asyncHandler = (fn) => async (requestAnimationFrame, resizeBy, next) => {
    try{
        await fn(req, res,next)
    }catch (error){
        resizeBy.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}