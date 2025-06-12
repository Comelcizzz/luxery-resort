const BaseService = require('./BaseService')
const Review = require('../models/Review')

class ReviewService extends BaseService {
    constructor() {
        super(Review)
    }

    async createReview(reviewData) {
        try {
            const review = new Review({
                ...reviewData,
                status: 'pending'
            })

            return await review.save()
        } catch (error) {
            throw new Error(`Error creating review: ${error.message}`)
        }
    }

    async getReviewsByType(type, id) {
        try {
            const query = { type }
            if (id) query.referenceId = id

            return await this.model.find(query)
                .populate('client', 'name email')
                .sort({ createdAt: -1 })
        } catch (error) {
            throw new Error(`Error getting reviews by type: ${error.message}`)
        }
    }

    async updateReviewStatus(id, status) {
        try {
            const review = await this.model.findById(id)
            if (!review) {
                throw new Error('Review not found')
            }

            review.status = status
            return await review.save()
        } catch (error) {
            throw new Error(`Error updating review status: ${error.message}`)
        }
    }

    async getReviewStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $group: {
                        _id: '$type',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 },
                        ratingDistribution: {
                            $push: {
                                rating: '$rating',
                                count: 1
                            }
                        }
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting review stats: ${error.message}`)
        }
    }

    async getClientReviews(clientId) {
        try {
            return await this.model.find({ client: clientId })
                .sort({ createdAt: -1 })
        } catch (error) {
            throw new Error(`Error getting client reviews: ${error.message}`)
        }
    }

    async getAverageRating(type, referenceId) {
        try {
            const result = await this.model.aggregate([
                {
                    $match: {
                        type,
                        referenceId,
                        status: 'approved'
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ])

            return result[0] || { averageRating: 0, totalReviews: 0 }
        } catch (error) {
            throw new Error(`Error getting average rating: ${error.message}`)
        }
    }

    async getReviewTrends(startDate, endDate) {
        try {
            const trends = await this.model.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        reviews: { $sum: 1 },
                        averageRating: { $avg: '$rating' }
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
            throw new Error(`Error getting review trends: ${error.message}`)
        }
    }

    async getReviewSentimentAnalysis() {
        try {
            const sentimentStats = await this.model.aggregate([
                {
                    $group: {
                        _id: '$type',
                        positive: {
                            $sum: {
                                $cond: [{ $gte: ['$rating', 4] }, 1, 0]
                            }
                        },
                        neutral: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $gte: ['$rating', 3] }, { $lt: ['$rating', 4] }] },
                                    1,
                                    0
                                ]
                            }
                        },
                        negative: {
                            $sum: {
                                $cond: [{ $lt: ['$rating', 3] }, 1, 0]
                            }
                        }
                    }
                }
            ])
            return sentimentStats
        } catch (error) {
            throw new Error(`Error getting sentiment analysis: ${error.message}`)
        }
    }

    async getReviewResponseTime() {
        try {
            const responseTimeStats = await this.model.aggregate([
                {
                    $match: {
                        responseTime: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        averageResponseTime: { $avg: '$responseTime' },
                        minResponseTime: { $min: '$responseTime' },
                        maxResponseTime: { $max: '$responseTime' }
                    }
                }
            ])
            return responseTimeStats
        } catch (error) {
            throw new Error(`Error getting review response time: ${error.message}`)
        }
    }

    async getReviewKeywords() {
        try {
            const keywords = await this.model.aggregate([
                {
                    $match: {
                        status: 'approved'
                    }
                },
                {
                    $project: {
                        words: { $split: ['$comment', ' '] }
                    }
                },
                {
                    $unwind: '$words'
                },
                {
                    $group: {
                        _id: { $toLower: '$words' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        _id: { $nin: ['', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'] }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 20
                }
            ])
            return keywords
        } catch (error) {
            throw new Error(`Error getting review keywords: ${error.message}`)
        }
    }

    async getReviewModerationStats() {
        try {
            const stats = await this.model.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        averageRating: { $avg: '$rating' }
                    }
                }
            ])
            return stats
        } catch (error) {
            throw new Error(`Error getting moderation stats: ${error.message}`)
        }
    }

    async getReviewImpact(type, referenceId) {
        try {
            const impact = await this.model.aggregate([
                {
                    $match: {
                        type,
                        referenceId,
                        status: 'approved'
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 },
                        helpfulVotes: { $sum: '$helpfulVotes' },
                        totalVotes: { $sum: '$totalVotes' }
                    }
                }
            ])

            return impact[0] || {
                averageRating: 0,
                totalReviews: 0,
                helpfulVotes: 0,
                totalVotes: 0
            }
        } catch (error) {
            throw new Error(`Error getting review impact: ${error.message}`)
        }
    }
}

module.exports = new ReviewService() 