
/********************************************************
* @errorResponse
* @Description This helper function takes res and error as argument and then sends an error response to the client. this function will be execute in the catch block, only if any error occurred. 
* @Parameters res, error
* @Return error message and status code 
*********************************************************/

const errorResponse = (res, error, controller) => {
   console.log(`ERROR FROM ${controller} CONTROLLER`);
   return res.status(error.code || 500).json({
      success: false,
      message: error.message || "Something went wrong",
      name: error.name
   })
}

module.exports = errorResponse;