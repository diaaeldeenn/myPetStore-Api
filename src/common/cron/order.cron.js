import cron from "node-cron";
import { autoConfirmOrders, autoShipOrders } from "../../modules/orders/order.service.js";

export const startOrderCron = () => {
  cron.schedule("0 * * * *", async () => {
    await autoConfirmOrders();
    await autoShipOrders();
  });
};