class AttachmentsController < ApplicationController
  def show
    attachment = Attachment.find(params[:id])
    send_file attachment.local_path,
              :filename => attachment.file_name,
              :content_type => attachment.content_type,
              :disposition => 'inline'
  end
end
