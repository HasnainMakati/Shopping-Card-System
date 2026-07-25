import cron from "node-cron";
import { Order_Items } from "../model/order-item.model.js";
import {Op} from "sequelize";
import { Orders } from "../model/orders.model.js";


const initOrderCron = () => {

    cron.schedule('0 0 * * *', async () => {

      try {
      const orderItemStatus = await Order_Items.update(
        { order_status: 'Delivered',success:'true' },
        {
          where: {
            order_status: 'Pending',
            createdAt: {
              [Op.lte]: new Date()
            }
          }
        }
      );

      const ordersStatus = await Orders.update(
        { order_status: 'Delivered', payment_status: 'Paid'},
        {
          where: {
            order_status: 'Pending',
            createdAt: {
              [Op.lte]: new Date()
            }
          }
        }
      )
      console.log(`Cron completed. ${orderItemStatus,ordersStatus} orders updated.`);
    } catch (error) {
      console.error("Error in order status cron job:", error);
    }
  });
};

export {initOrderCron}