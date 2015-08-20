class NotesController < ApplicationController
  before_filter :execute_search, only: [:index, :show, :edit, :new, :sidebar]

  def index
    render :layout => 'browser'
  end

  def show
    @note = Note.find(params[:id])
    respond_to do |format|
      format.html do
        if request.xhr?
          render layout: '_viewport'
        else
          render layout: 'browser'
        end
      end
      format.json{ render :json => @note }
    end
  end

  def edit
    @note = Note.find(params[:id])
    render layout: 'browser'
  end

  def new
    @note = Note.new
    render 'edit', layout: 'browser'
  end

  def create
    params[:note][:date] = Time.utc(*params[:note][:date].split('/').map(&:to_i))

    @note = Note.new(params[:note])

    if @note.save
      render :json => @note
    else
      render :json => @note.errors,  :status => :unprocessable_entity
    end
  end

  def update
    @note = Note.find(params[:id])

    if @note.update_attributes(params[:note])
      render :json => @note
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

  def autocomplete
    term = params[:term]
    if term[0] == '.'
      matches = Tag.autocomplete(term[1..-1]).map do |tag|
        {:label => '.'+tag, :value => '.'+tag}
      end
    else
      notes = Note.where('notes.title like ?', "%#{params[:term]}%")
      matches = notes.pluck(:title).uniq.sort.map do |title|
        {:label => title, :value => title.inspect}
      end
    end
    render :json => matches.flatten
  end

  def preview
    @note = Note.new(params[:note])
    render @note
  end

  def sidebar
    render partial: 'layouts/sidebar'
  end

  def tune_widget
    render :layout => 'basic'
  end

  private

  def execute_search
    @filtered_notes = Filter.new(params[:f]).notes
  end
end
