const BaseService = require('./BaseService')
const Room = require('../models/Room')

class RoomService extends BaseService {
    constructor() {
        super(Room)
    }

    async findAvailableRooms(checkIn, checkOut) {
        try {
            return await this.model.find({
                $or: [
                    { bookings: { $exists: false } },
                    {
                        bookings: {
                            $not: {
                                $elemMatch: {
                                    $or: [
                                        {
                                            checkIn: { $lte: checkOut },
                                            checkOut: { $gte: checkIn }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            })
        } catch (error) {
            throw new Error(`Error finding available rooms: ${error.message}`)
        }
    }

    async getRoomStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $group: {
                        _id: '$type',
                        totalRooms: { $sum: 1 },
                        averagePrice: { $avg: '$price' },
                        totalCapacity: { $sum: '$capacity' }
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting room stats: ${error.message}`)
        }
    }

    async searchRooms(criteria) {
        try {
            const query = {}
            if (criteria.type) query.type = criteria.type
            if (criteria.minPrice) query.price = { $gte: criteria.minPrice }
            if (criteria.maxPrice) query.price = { ...query.price, $lte: criteria.maxPrice }
            if (criteria.capacity) query.capacity = { $gte: criteria.capacity }
            if (criteria.amenities) query.amenities = { $all: criteria.amenities }

            return await this.model.find(query)
        } catch (error) {
            throw new Error(`Error searching rooms: ${error.message}`)
        }
    }

    async getRoomOccupancyStats(startDate, endDate) {
        try {
            const stats = await this.model.aggregate([
                {
                    $unwind: '$bookings'
                },
                {
                    $match: {
                        'bookings.checkIn': { $gte: startDate },
                        'bookings.checkOut': { $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        totalBookings: { $sum: 1 },
                        totalRevenue: { $sum: '$bookings.totalPrice' },
                        averageStayDuration: {
                            $avg: {
                                $divide: [
                                    { $subtract: ['$bookings.checkOut', '$bookings.checkIn'] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting room occupancy stats: ${error.message}`)
        }
    }

    async getRoomMaintenanceSchedule() {
        try {
            const rooms = await this.model.find({
                lastMaintenance: { $exists: true }
            }).sort({ lastMaintenance: 1 })

            return rooms.map(room => ({
                roomId: room._id,
                type: room.type,
                lastMaintenance: room.lastMaintenance,
                nextMaintenance: new Date(room.lastMaintenance.getTime() + 30 * 24 * 60 * 60 * 1000)
            }))
        } catch (error) {
            throw new Error(`Error getting maintenance schedule: ${error.message}`)
        }
    }

    async updateRoomMaintenance(roomId) {
        try {
            const room = await this.model.findById(roomId)
            if (!room) {
                throw new Error('Room not found')
            }

            room.lastMaintenance = new Date()
            return await room.save()
        } catch (error) {
            throw new Error(`Error updating room maintenance: ${error.message}`)
        }
    }

    async getRoomAmenitiesStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $unwind: '$amenities'
                },
                {
                    $group: {
                        _id: '$amenities',
                        count: { $sum: 1 },
                        averagePrice: { $avg: '$price' }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting amenities stats: ${error.message}`)
        }
    }

    async getRoomPriceHistory(roomId) {
        try {
            const room = await this.model.findById(roomId)
            if (!room) {
                throw new Error('Room not found')
            }

            return room.priceHistory || []
        } catch (error) {
            throw new Error(`Error getting price history: ${error.message}`)
        }
    }

    async updateRoomPrice(roomId, newPrice) {
        try {
            const room = await this.model.findById(roomId)
            if (!room) {
                throw new Error('Room not found')
            }

            const priceHistory = room.priceHistory || []
            priceHistory.push({
                price: room.price,
                date: new Date()
            })

            room.price = newPrice
            room.priceHistory = priceHistory
            return await room.save()
        } catch (error) {
            throw new Error(`Error updating room price: ${error.message}`)
        }
    }
}

module.exports = new RoomService() 