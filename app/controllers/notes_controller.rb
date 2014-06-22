class NotesController < ApplicationController
  def browse
    render :layout => 'browser'
  end

  def filter
    unpinned = Filter.new(params[:filter]).notes
    pinned = Note.pinned.order('notes.original_date DESC')

    [pinned, unpinned].each do |set|
      set.map! do |note|
        {
          :id => note.id,
          :original_date => note.original_date,
          :preview => note.preview,
          :is_pinned => note.is_pinned,
          :tags => note.tags.map{ |tag| {:short_label => tag.short_label} }
        }
      end
    end

    render :json => {:pinned => pinned, :unpinned => unpinned}
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

  def pin
    if Note.find(params[:id]).pin!
      render :json => @note
    end
  end

  def unpin
    if Note.find(params[:id]).unpin!
      render :json => @note
    end
  end
end
