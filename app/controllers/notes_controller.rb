class NotesController < ApplicationController
  def browse
    render :layout => 'browser'
  end

  def filter
    @filter = Filter.new(params[:filter])
    render :json => @filter.notes, 
           :only => :id, 
           :include => [:tags => {
                          :only => [], :methods => :short_label
                        }],
           :methods => :preview
  end
  
  def new
    @note = Note.new
    render @note
  end
  
  def show
    @note = Note.find(params[:id])
    respond_to do |format|
      format.html{ render @note }
      format.json{ render :json => @note }
    end
  end

  def preview
    @note = Note.new(params[:note])
    render @note
  end

  def create
    params[:note][:date] = Time.utc(*params[:note][:date].split('/').map(&:to_i))
    
    @note = Note.new(params[:note])

    if @note.save
      redirect_to note_path(@note, :format => 'json')
    else
      render :json => @note.errors,  :status => :unprocessable_entity
    end
  end

  def update
    @note = Note.find(params[:id])

    if @note.update_attributes(params[:note])
      redirect_to note_path(@note, :format => 'json')
    else
      render :json => @note.errors,  :status => :unprocessable_entity      
    end
  end
end
