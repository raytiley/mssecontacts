class ContactsController < ActionController::Base
	respond_to :json

	def index
		@contacts = Contact.all
		respond_with @contacts
	end

	def create
		@contact = Contact.create(params[:contact])
		respond_with @contact
	end

	def show
		@contact = Contact.find(params[:id])
		respond_with @contact
	end

	def update
    	@contact = Contact.find(params[:id])
    	@contact.update_attributes!(params[:contact])
    	respond_with @contact
    end

	def destroy
    	@contact = Contact.find(params[:id])
    	@contact.delete
    	respond_with @contact
    end
end