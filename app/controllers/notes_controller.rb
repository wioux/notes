class NotesController < ApplicationController
  def browse
    @item_id = params[:item_id].presence
    render :layout => 'browser'
  end

  def filter
    mix_pinned = (params[:mix_pinned] == 'true')

    pinned = mix_pinned && []
    pinned ||= Note.pinned.preload(:tags).order('notes.original_date DESC')
    unpinned = Filter.new(params[:filter], :is_pinned => mix_pinned).notes
    tags = Tag.labels

    [pinned, unpinned].each do |set|
      set.map! do |note|
        {
          :id => note.id,
          :original_date => note.original_date,
          :preview => note.preview,
          :is_pinned => note.is_pinned && !mix_pinned,
          :tags => note.tags.map{ |tag| {:short_label => tag.short_label} }
        }
      end
    end

    render :json => {:pinned => pinned, :unpinned => unpinned, :tags => tags}
  end

  def autocomplete
    term = params[:term]
    matches = Tag.autocomplete(term).map do |tag|
      {:label => '.'+tag, :value => '.'+tag}
    end

    notes = Note.where('notes.title like ?', "%#{params[:term]}%")
    matches << notes.pluck(:title).uniq.sort.map do |title|
      {:label => title, :value => title.inspect}
    end

    render :json => matches.flatten
  end

  def tune_widget
    render :layout => 'basic'
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

  def destroy
    @note = Note.find(params[:id])
    @note.is_history = true
    @note.present_id = @note.id
    if @note.save
      render :json => {:success => true}
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
