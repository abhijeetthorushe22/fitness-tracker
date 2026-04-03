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

        if (!filePath) {
            return ctx.badRequest("Could not read uploaded file");
        }

        try{
            const result = await analyzeImage(filePath);
            return ctx.send({success:true, result})
        }catch(error: any){
            console.error("Image analysis error:", error);
            const message = error.message || "Analysis failed";
            ctx.status = 500;
            return ctx.send({
                data: null,
                error: {
                    status: 500,
                    name: "InternalServerError",
                    message: message,
                    details: {}
                }
            });
        }
    }
}