const Orders = require('../models/orderModel')



const findIncome = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        console.log(startDate, endDate);

        const ordersData = await Orders.find(
            {
                "products.OrderStatus": "Delivered",
                createdAt: {
                    $gte: startDate,
                    $lt: endDate 
                }
            }
        );
        // console.log("ordersData", ordersData);

        let totalIncome = 0;
        for( const order of ordersData){
            for(const pdt of order.products){
                if(pdt.OrderStatus === 'Delivered'){
                    totalIncome += parseInt(order.totalAmount)
                }
            }
        }
        
        return formatNum(totalIncome)

    } catch (error) {
        throw error
    }
}


const countSales = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        const ordersData = await Orders.find(
            {
                "products.OrderStatus": "Delivered",
                createdAt: {
                    $gte: startDate,
                    $lt: endDate 
                }
            }
        );
        console.log("ordersData", ordersData);

        
        let salesCount = 0;
        for( const order of ordersData){
            for(const pdt of order.products){
                if(pdt.OrderStatus=== 'Delivered'){
                    salesCount += pdt.quantity;
                }
            }
        }


        return salesCount;

    } catch (error) {
        throw error
    }
}

const findSalesData = async(startDate = new Date('1990-01-01'), endDate = new Date()) => {
    try {
        const pipeline = [
            {
                $match: {
                    "producuts.OrderStatus": 'Delivered',
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group:{
                    _id: { createdAt: { $dateToString: { format: '%Y', date: '$createdAt'}}},
                    sales: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id. createdAt' : 1 }
            }
        ]

        const orderData = await Orders.aggregate(pipeline)
        return orderData

    } catch (error) {
        throw error
    }
}



const findSalesDataOfMonth = async (year, month) => {
    try {
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);

        const pipeline = [
            {
                $match: {
                    "products.OrderStatus": 'Delivered',
                    date: {
                        $gte: firstDayOfMonth,
                        $lt: lastDayOfMonth,
                    },
                },
            },
            {
                $addFields: {
                    weekNumber: {
                        $ceil: {
                            $divide: [
                                { $subtract: ["$date", firstDayOfMonth] },
                                604800000, // milliseconds in a week (7 days)
                            ],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: { weekNumber: "$weekNumber" }, // Group by week number
                    sales: { $sum: '$totalAmount' }, // Corrected to 'totalAmount'
                },
            },
            { $sort: { '_id.weekNumber': 1 } },
        ];

        const orderData = await Orders.aggregate(pipeline);
        console.log("pipeline is:", orderData);
        return orderData;
    } catch (error) {
        throw error;
    }
};
const findSalesDataOfYear = async(year) => {
    try {
        
        const pipeline = [
            {
                $match: {
                    "producuts.OrderStatus": 'Delivered',
                    date: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${year + 1}-01-01`)
                    }
                }
            },
            {
                $group:{
                    _id: {  createdAt: { $dateToString: { format: '%m', date: '$createdAt'}}},
                    sales: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id. createdAt' : 1 }
            }
        ]

        const orderData = await Orders.aggregate(pipeline)

        console.log("findSalesDataOfYear : ",orderData);
        return orderData

    } catch (error) {
        throw error
    }
}








const  formatNum = (num) => {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(2) + ' L';
    } else if(num >= 1000){
        return (num / 1000).toFixed(2) + ' K '
    } else {
        return num.toString();
    }
}


module.exports = {
    formatNum,
    findIncome,
    countSales,
    findSalesData,
    findSalesDataOfYear,
    findSalesDataOfMonth
}