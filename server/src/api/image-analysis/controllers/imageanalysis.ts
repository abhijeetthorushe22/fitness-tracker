import { Context } from "koa"
import { analyzeImage } from "../services/gemini";

export default {
    async analyze(ctx: Context) {
        const file = ctx.request.files?.image as any;
        if (!file) return ctx.badRequest("No Image is uploaded")
        
        let filePath = '';
        if (Array.isArray(file)) {
            filePath = file[0].filepath || file[0].path;
        } else {
            filePath = file.filepath || file.path;
        }

        try{
            const result = await analyzeImage(filePath);
            return ctx.send({success:true,result})
        }catch(error){
            ctx.internalServerError("analysis failed",
            {error:(error as any).message})


        }
    }
}