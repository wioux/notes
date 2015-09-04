class SavedFiltersController < ApplicationController
  before_action :set_saved_filter, only: :destroy

  # POST /saved_filters
  def create
    @saved_filter = SavedFilter.new(saved_filter_params)

    if @saved_filter.save
      redirect_to :back
    end
  end

  # DELETE /saved_filters/1
  def destroy
    @saved_filter.destroy
    render json: { success: true }
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_saved_filter
      @saved_filter = SavedFilter.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def saved_filter_params
      params.require(:saved_filter).permit(:name, :value)
    end
end
