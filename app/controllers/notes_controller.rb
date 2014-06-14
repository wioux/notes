class NotesController < ApplicationController
  # GET /notes
  # GET /notes.json
  
  def index
    unless @filter
      fields = {}
      if params[:title]
        fields[:title] = params[:title]
      end
      @filter = Filter.new(params[:filter], fields)
    end

    if params[:order] == 'version_date'
      @filter.order_by_version_date
    else
      @filter.order_by_original_date
    end

    respond_to do |format|
      format.html do
        if request.xhr?
          render :layout => nil
        else
          render 'index'
        end
      end
      format.json { render :json => @notes }
    end
  end

  def filter
    @filter = Filter.new(params[:filter])
    render :json => @filter.notes, :only => :id, :include => [:tags => {:only => [], :methods => :short_label}], :methods => :preview
  end
  
  def browse
    render :layout => 'browser'
  end
  
  def scratch
    render :layout => 'browser'
  end

  def show
    @note = Note.find(params[:id])
    if request.xhr?
      render :partial => 'note'
    end
  end

  # GET /notes/1/edit
  def edit
    @note = Note.find(params[:id]).successors.build
    if request.xhr?
      render :partial => 'edit'
    end
  end

  # POST /notes
  # POST /notes.json
  def create
    params[:note][:date] =
      Time.utc(*params[:note][:date].split('/').map(&:to_i))

    if previous = Note.find_by_id(params[:previous_note_id])
      @note = previous.successors.build(params[:note])
    else
      @note = Note.new(params[:note])
    end

    respond_to do |format|
      if @note.save
        format.html { redirect_to notes_path, :notice => 'Note was successfully created.' }
        format.json { render :json => @note, :status => :created, :location => @note }
      else
        format.html { render :action => "new" }
        format.json { render :json => @note.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /notes/1
  # PUT /notes/1.json
  def update
    @note = Note.find(params[:id])

    if @note.update_attributes(params[:note])
      redirect_to notes_path, :notice => 'Note was successfully updated.'
    end
  end

  # DELETE /notes/1
  # DELETE /notes/1.json
  def destroy
    @note = Note.find(params[:id])
    @note.destroy

    respond_to do |format|
      format.html { redirect_to notes_url }
      format.json { head :no_content }
    end
  end
end
