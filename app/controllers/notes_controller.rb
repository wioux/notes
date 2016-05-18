class NotesController < ApplicationController
  helper_method :filter_results

  def index
    respond_to do |format|
      format.html do
        render layout: (request.xhr? ? nil : "browser")
      end
      format.json do
        render json: { results: filter_results,
                       tags: tags_scope.labels,
                       saved_filters: SavedFilter.all }
      end
    end
  end

  def show
    @note = notes_scope.find(params[:id])
    render layout: (request.xhr? ? nil : "browser")
  end

  def edit
    @note = notes_scope.find(params[:id])
    render layout: (request.xhr? ? nil : "browser")
  end

  def update
    @note = notes_scope.find(params[:id])
    if @note.update_attributes(params[:note])
      respond_to do |format|
        format.html{ redirect_to note_path(@note, f: params[:f]) }
        format.json do
          item = @note.as_json
          item["url"] = note_path(@note, f: params[:f])
          render json: item
        end
      end
    else
      render :json => @note.errors,  :status => :unprocessable_entity
    end
  end

  def new
    @note = notes_scope.new
    render layout: (request.xhr? ? nil : "browser")
  end

  def create
    params[:note][:date] = Time.utc(*params[:note][:date].split('/').map(&:to_i))

    @note = notes_scope.new(params[:note])

    if @note.save
      respond_to do |format|
        format.html{ redirect_to note_path(@note, f: params[:f]) }
        format.json do
          item = @note.as_json
          item["url"] = note_path(@note, f: params[:f])
          render json: item
        end
      end
    else
      render :json => @note.errors,  :status => :unprocessable_entity
    end
  end

  def destroy
    @note = notes_scope.find(params[:id])
    @note.transaction do
      @note.save_version!
      @note.destroy
    end
    render json: { :success => true }
  end

  def autocomplete
    term = params[:term]
    if term[0] == '.'
      matches = tags_scope.autocomplete(term[1..-1]).map do |tag|
        {:label => '.'+tag, :value => '.'+tag}
      end
    else
      notes = notes_scope.where('lower(notes.title) LIKE ?', "%#{params[:term].downcase}%")
      matches = notes.pluck(:title).uniq.sort.map do |title|
        {:label => title, :value => title.inspect}
      end
    end
    render :json => matches.flatten
  end

  def tune_widget
    render :layout => 'basic'
  end

  private

  def filter_results
    @filter_results ||=
      begin
        results = Filter.new(params[:f], user: current_user).notes.as_json(
          only: :id, methods: :preview,
          include: {
            tags: { only: :id, methods: :short_label }
          }
        )
        results.each{ |item| item["url"] = note_path(item["id"], f: params[:f]) }
      end
  end

  def notes_scope
    if logged_in?
      Note.where("notes.user_id = ? OR notes.public = ?", current_user.id, true)
    else
      Note.where(public: true)
    end
  end

  def tags_scope
    if logged_in?
      Tag.joins(:note).where("notes.public = ? OR notes.user_id = ?",
                             true, current_user.id)
    else
      Tag.joins(:note).where(notes: { public: true })
    end
  end
end
