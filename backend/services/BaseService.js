class BaseService {
    constructor(model) {
        this.model = model
    }

    async findAll(query = {}, options = {}) {
        try {
            return await this.model.find(query, null, options)
        } catch (error) {
            throw new Error(`Error finding all: ${error.message}`)
        }
    }

    async findById(id) {
        try {
            return await this.model.findById(id)
        } catch (error) {
            throw new Error(`Error finding by id: ${error.message}`)
        }
    }

    async create(data) {
        try {
            const newItem = new this.model(data)
            return await newItem.save()
        } catch (error) {
            throw new Error(`Error creating: ${error.message}`)
        }
    }

    async update(id, data) {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true })
        } catch (error) {
            throw new Error(`Error updating: ${error.message}`)
        }
    }

    async delete(id) {
        try {
            return await this.model.findByIdAndDelete(id)
        } catch (error) {
            throw new Error(`Error deleting: ${error.message}`)
        }
    }
}

module.exports = BaseService 