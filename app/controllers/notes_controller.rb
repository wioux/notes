class NotesController < ApplicationController
  helper_method :filter_results

  def index
    respond_to do |format|
      format.html do
        render layout: (request.xhr? ? nil : "browser")
      end
      format.json do
        render json: { results: filter_results,
                       tags: Tag.labels,
                       saved_filters: SavedFilter.all }
      end
    end
  end

  def show
    @note = Note.find(params[:id])
    render layout: (request.xhr? ? nil : "browser")
  end

  def edit
    @note = Note.find(params[:id])
    render layout: (request.xhr? ? nil : "browser")
  end

  def update
    @note = Note.find(params[:id])
    if @note.update_attributes(params[:note])
      item = @note.as_json
      item["url"] = note_path(@note)
      render json: item
    else
      render :json => @note.errors,  :status => :unprocessable_entity
    end
  end

  def new
    @note = Note.new
    render layout: (request.xhr? ? nil : "browser")
  end

  def create
    params[:note][:date] = Time.utc(*params[:note][:date].split('/').map(&:to_i))

    @note = Note.new(params[:note])

    if @note.save
      item = @note.as_json
      item["url"] = note_path(@note)
      render json: item
    else
      render :json => @note.errors,  :status => :unprocessable_entity
    end
  end

  def destroy
    @note = Note.find(params[:id])
    @note.transaction do
      @note.save_version!
      @note.destroy
    end
    render json: { :success => true }
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

  def tune_widget
    render :layout => 'basic'
  end

  private

  def filter_results
    @filter_results ||=
      begin
        results = Filter.new(params[:f]).notes.as_json(
          only: :id, methods: :preview,
          include: {
            tags: { only: :id, methods: :short_label }
          }
        )
        results.each{ |item| item["url"] = note_path(item["id"]) }
      end
  end
end
