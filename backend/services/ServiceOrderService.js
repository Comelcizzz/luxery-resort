const BaseService = require('./BaseService')
const ServiceOrder = require('../models/ServiceOrder')
const Service = require('../models/Service')

class ServiceOrderService extends BaseService {
    constructor() {
        super(ServiceOrder)
    }

    async createServiceOrder(orderData) {
        try {
            const service = await Service.findById(orderData.service)
            if (!service) {
                throw new Error('Service not found')
            }

            if (!service.availability) {
                throw new Error('Service is not available')
            }

            const order = new ServiceOrder({
                ...orderData,
                status: 'pending',
                totalPrice: service.price
            })

            return await order.save()
        } catch (error) {
            throw new Error(`Error creating service order: ${error.message}`)
        }
    }

    async getClientOrders(clientId) {
        try {
            return await this.model.find({ client: clientId })
                .populate('service')
                .sort({ createdAt: -1 })
        } catch (error) {
            throw new Error(`Error getting client orders: ${error.message}`)
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const order = await this.model.findById(id)
            if (!order) {
                throw new Error('Order not found')
            }

            order.status = status
            return await order.save()
        } catch (error) {
            throw new Error(`Error updating order status: ${error.message}`)
        }
    }

    async getOrderStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalRevenue: { $sum: '$totalPrice' }
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting order stats: ${error.message}`)
        }
    }

    async getServiceOrdersByDateRange(startDate, endDate) {
        try {
            return await this.model.find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate('service')
        } catch (error) {
            throw new Error(`Error getting orders by date range: ${error.message}`)
        }
    }
}

module.exports = new ServiceOrderService() 