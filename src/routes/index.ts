import { Hono } from "hono";
import userApp from "./user.route";
import chatApp from "./chat.route";

const apiRouter = new Hono()

apiRouter.route('/users', userApp)
apiRouter.route('/chat', chatApp)

// 导出总路由接口
export default apiRouter