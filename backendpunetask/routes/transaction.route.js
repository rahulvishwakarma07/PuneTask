import express from 'express';
import { InitializeData, barChart, listData, pieChart, statisticsPrice } from '../controller/transaction.controller.js';

const router = express.Router();

router.get('/data_init', InitializeData);

router.get('/AllData', listData);

router.get('/statistics', statisticsPrice);

router.get('/bar_chart', barChart);

router.get('/pie_chart', pieChart);

// router.get('/api/combined', async (req, res) => {
//     const { month } = req.query;

//     try {
//         const transactions = await axios.get(`http://localhost:${PORT}/api/transactions`, { params: { month } });
//         const statistics = await axios.get(`http://localhost:${PORT}/api/statistics`, { params: { month } });
//         const barChart = await axios.get(`http://localhost:${PORT}/api/bar-chart`, { params: { month } });
//         const pieChart = await axios.get(`http://localhost:${PORT}/api/pie-chart`, { params: { month } });

//         res.status(200).json({
//             transactions: transactions.data,
//             statistics: statistics.data,
//             barChart: barChart.data,
//             pieChart: pieChart.data,
//         });
//     } catch (error) {
//         res.status(500).send('Error fetching combined data');
//     }
// });

export default router;