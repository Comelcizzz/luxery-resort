const BaseService = require('./BaseService')
const Booking = require('../models/Booking')
const Room = require('../models/Room')

class BookingService extends BaseService {
    constructor() {
        super(Booking)
    }

    async createBooking(bookingData) {
        try {
            const room = await Room.findById(bookingData.room)
            if (!room) {
                throw new Error('Room not found')
            }

            // Check if room is available
            const isAvailable = await this.checkRoomAvailability(
                bookingData.room,
                bookingData.checkIn,
                bookingData.checkOut
            )

            if (!isAvailable) {
                throw new Error('Room is not available for selected dates')
            }

            // Calculate total price
            const nights = Math.ceil(
                (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)
            )
            const totalPrice = room.price * nights

            const booking = new Booking({
                ...bookingData,
                totalPrice,
                status: 'pending'
            })

            return await booking.save()
        } catch (error) {
            throw new Error(`Error creating booking: ${error.message}`)
        }
    }

    async checkRoomAvailability(roomId, checkIn, checkOut) {
        try {
            const conflictingBookings = await this.model.find({
                room: roomId,
                status: { $ne: 'cancelled' },
                $or: [
                    {
                        checkIn: { $lte: checkOut },
                        checkOut: { $gte: checkIn }
                    }
                ]
            })

            return conflictingBookings.length === 0
        } catch (error) {
            throw new Error(`Error checking room availability: ${error.message}`)
        }
    }

    async getClientBookings(clientId) {
        try {
            return await this.model.find({ client: clientId })
                .populate('room')
                .sort({ checkIn: -1 })
        } catch (error) {
            throw new Error(`Error getting client bookings: ${error.message}`)
        }
    }

    async updateBookingStatus(id, status) {
        try {
            const booking = await this.model.findById(id)
            if (!booking) {
                throw new Error('Booking not found')
            }

            booking.status = status
            return await booking.save()
        } catch (error) {
            throw new Error(`Error updating booking status: ${error.message}`)
        }
    }

    async getBookingStats() {
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
            throw new Error(`Error getting booking stats: ${error.message}`)
        }
    }

    // Нові функції
    async getBookingTrends(startDate, endDate) {
        try {
            const trends = await this.model.aggregate([
                {
                    $match: {
                        checkIn: { $gte: startDate },
                        checkOut: { $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$checkIn' },
                            month: { $month: '$checkIn' },
                            day: { $dayOfMonth: '$checkIn' }
                        },
                        bookings: { $sum: 1 },
                        revenue: { $sum: '$totalPrice' }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1,
                        '_id.day': 1
                    }
                }
            ])
            return trends
        } catch (error) {
            throw new Error(`Error getting booking trends: ${error.message}`)
        }
    }

    async getCancellationStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $match: {
                        status: 'cancelled'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        cancellations: { $sum: 1 },
                        lostRevenue: { $sum: '$totalPrice' }
                    }
                },
                {
                    $sort: {
                        '_id.year': -1,
                        '_id.month': -1
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting cancellation stats: ${error.message}`)
        }
    }

    async getPeakSeasons() {
        try {
            const peakSeasons = await this.model.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: '$checkIn' }
                        },
                        bookings: { $sum: 1 },
                        averagePrice: { $avg: '$totalPrice' }
                    }
                },
                {
                    $sort: { bookings: -1 }
                }
            ])
            return peakSeasons
        } catch (error) {
            throw new Error(`Error getting peak seasons: ${error.message}`)
        }
    }

    async getBookingDurationStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $addFields: {
                        duration: {
                            $divide: [
                                { $subtract: ['$checkOut', '$checkIn'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageDuration: { $avg: '$duration' },
                        minDuration: { $min: '$duration' },
                        maxDuration: { $max: '$duration' }
                    }
                }
            ])
            return stats[0]
        } catch (error) {
            throw new Error(`Error getting booking duration stats: ${error.message}`)
        }
    }

    async getClientBookingHistory(clientId) {
        try {
            const history = await this.model.find({ client: clientId })
                .populate('room')
                .sort({ checkIn: -1 })
                .limit(10)

            const stats = await this.model.aggregate([
                {
                    $match: { client: clientId }
                },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalSpent: { $sum: '$totalPrice' },
                        averageStayDuration: {
                            $avg: {
                                $divide: [
                                    { $subtract: ['$checkOut', '$checkIn'] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    }
                }
            ])

            return {
                history,
                stats: stats[0] || {
                    totalBookings: 0,
                    totalSpent: 0,
                    averageStayDuration: 0
                }
            }
        } catch (error) {
            throw new Error(`Error getting client booking history: ${error.message}`)
        }
    }
}

module.exports = new BookingService() 