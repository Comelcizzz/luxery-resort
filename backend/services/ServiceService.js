const BaseService = require('./BaseService')
const Service = require('../models/Service')
const ServiceOrder = require('../models/ServiceOrder')

class ServiceService extends BaseService {
    constructor() {
        super(Service)
    }

    async getServicesByCategory(category) {
        try {
            return await this.model.find({ category })
        } catch (error) {
            throw new Error(`Error getting services by category: ${error.message}`)
        }
    }

    async searchServices(criteria) {
        try {
            const query = {}
            if (criteria.category) query.category = criteria.category
            if (criteria.minPrice) query.price = { $gte: criteria.minPrice }
            if (criteria.maxPrice) query.price = { ...query.price, $lte: criteria.maxPrice }
            if (criteria.availability) query.availability = criteria.availability

            return await this.model.find(query)
        } catch (error) {
            throw new Error(`Error searching services: ${error.message}`)
        }
    }

    async getServiceStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $group: {
                        _id: '$category',
                        totalServices: { $sum: 1 },
                        averagePrice: { $avg: '$price' },
                        totalBookings: { $sum: '$bookings' }
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting service stats: ${error.message}`)
        }
    }

    async updateAvailability(id, isAvailable) {
        try {
            const service = await this.model.findById(id)
            if (!service) {
                throw new Error('Service not found')
            }

            service.availability = isAvailable
            return await service.save()
        } catch (error) {
            throw new Error(`Error updating service availability: ${error.message}`)
        }
    }

    async getServicePopularityStats(startDate, endDate) {
        try {
            const stats = await this.model.aggregate([
                {
                    $lookup: {
                        from: 'serviceorders',
                        localField: '_id',
                        foreignField: 'service',
                        as: 'orders'
                    }
                },
                {
                    $unwind: '$orders'
                },
                {
                    $match: {
                        'orders.createdAt': {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        category: { $first: '$category' },
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$price' }
                    }
                },
                {
                    $sort: { totalOrders: -1 }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting service popularity stats: ${error.message}`)
        }
    }

    async getServiceSchedule(serviceId, date) {
        try {
            const service = await this.model.findById(serviceId)
            if (!service) {
                throw new Error('Service not found')
            }

            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)

            const orders = await ServiceOrder.find({
                service: serviceId,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ date: 1 })

            return {
                service,
                orders,
                availableSlots: this.calculateAvailableSlots(service, orders, date)
            }
        } catch (error) {
            throw new Error(`Error getting service schedule: ${error.message}`)
        }
    }

    calculateAvailableSlots(service, orders, date) {
        const slots = []
        const startTime = new Date(date)
        startTime.setHours(9, 0, 0, 0) // Початок робочого дня
        const endTime = new Date(date)
        endTime.setHours(18, 0, 0, 0) // Кінець робочого дня

        let currentTime = new Date(startTime)
        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + service.duration * 60000)
            const isSlotAvailable = !orders.some(order => {
                const orderStart = new Date(order.date)
                const orderEnd = new Date(orderStart.getTime() + service.duration * 60000)
                return (
                    (currentTime >= orderStart && currentTime < orderEnd) ||
                    (slotEnd > orderStart && slotEnd <= orderEnd)
                )
            })

            if (isSlotAvailable) {
                slots.push({
                    start: new Date(currentTime),
                    end: slotEnd
                })
            }

            currentTime = new Date(currentTime.getTime() + 30 * 60000) // 30-хвилинні слоти
        }

        return slots
    }

    async getServiceRevenueStats(period) {
        try {
            const startDate = new Date()
            switch (period) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7)
                    break
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1)
                    break
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1)
                    break
                default:
                    throw new Error('Invalid period')
            }

            const stats = await this.model.aggregate([
                {
                    $lookup: {
                        from: 'serviceorders',
                        localField: '_id',
                        foreignField: 'service',
                        as: 'orders'
                    }
                },
                {
                    $unwind: '$orders'
                },
                {
                    $match: {
                        'orders.createdAt': { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        category: { $first: '$category' },
                        revenue: { $sum: '$price' },
                        orders: { $sum: 1 }
                    }
                },
                {
                    $sort: { revenue: -1 }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting service revenue stats: ${error.message}`)
        }
    }

    async getServiceCategories() {
        try {
            const categories = await this.model.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        averagePrice: { $avg: '$price' }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ])
            return categories
        } catch (error) {
            throw new Error(`Error getting service categories: ${error.message}`)
        }
    }
}

module.exports = new ServiceService() 