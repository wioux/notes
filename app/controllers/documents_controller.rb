class DocumentsController < ApplicationController
  layout "basic"

  def show
    @note = notes_scope.find(params[:id])
  end

  private

  def notes_scope
    if logged_in?
      Note.where("notes.user_id = ? OR notes.public = ?", current_user.id, true)
    else
      Note.where(public: true)
    end
  end
end
