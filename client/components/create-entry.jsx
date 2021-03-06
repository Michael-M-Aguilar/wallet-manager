import React from 'react';
import Spinner from './spinner';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

export default class CreateEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      note: '',
      category: '',
      date: '',
      address: '',
      categories: '',
      loading: true
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.renderPlaces = this.renderPlaces.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    this.getCategories();
  }

  getCategories() {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        this.setState({ categories: data });
        this.setState({ loading: false });
      });
  }

  handleChange(event) {
    if (event.target.id === 'amount') {
      this.setState({
        amount: event.target.value
      });
    }
    if (event.target.id === 'note') {
      this.setState({
        note: event.target.value
      });
    }
    if (event.target.id === 'categories') {
      this.setState({
        category: event.target.value
      });
    }
    if (event.target.id === 'date') {
      this.setState({
        date: event.target.value
      });
    }
  }

  handleSubmit(event) {
    fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    })
      .then(res => res.json())
      .then(() => {
        location.hash = '#';
      })
      .catch(err => {
        console.error(err);
      });
    event.preventDefault();
  }

  handleAddressChange(address) {
    this.setState({ address });
    if (event.target.id === 'address') {
      this.setState({
        address: event.target.value
      });
    }
  }

  handleSelect(address) {
    this.setState({ address });
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .catch(error => console.error('Error', error));
  }

  renderPlaces() {
    return (
      <PlacesAutocomplete value={this.state.address} onChange={this.handleAddressChange} onSelect={this.handleSelect}>
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          this.renderInput({ getInputProps, suggestions, getSuggestionItemProps, loading })
        )}
      </PlacesAutocomplete>
    );
  }

  renderInput({ getInputProps, suggestions, getSuggestionItemProps, loading }) {
    return (
      <>
        <label className="google-label dm-text raleway fs-3 mx-4">Location:</label>
        <input {...getInputProps({ placeholder: '(This is optional)...' })} id="address" className="form-control mx-1 input-background raleway fs-4 dm-text border border-4 rounded-pill border-dark" />
        <div className="location-dropdown">
          {loading
            ? <div> ... loading </div>
            : ''}
          {suggestions.map(suggestion => {
            const className = suggestion.active
              ? 'suggestion-item-active'
              : 'suggestion';
            const style = suggestion.active
              ? { backgroundColor: '#616E7C', cursor: 'pointer' }
              : { backgroundColor: '#3E4C59', cursor: 'pointer' };
            return (
              <div {...getSuggestionItemProps(suggestion, {
                className, style
              })}
                key={suggestion.index}
                className="dm-text raleway mx-3">
                <span>{suggestion.description}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  render() {
    const renderPlaces = this.renderPlaces();
    const { categories } = this.state;
    if (this.state.loading) {
      return <Spinner />;
    } else {
      return (
      <form className="" onSubmit={this.handleSubmit}>
        <div className="flex justify-content-between">
          <div className="input-group mx-3 border border-4 border-dark rounded ">
            <span className="input-group-text fs-5 text-header">$</span>
            <label htmlFor="amount" className="form-label raleway dm-text"></label>
            <input type="number" placeholder="Add an expense..." min="0.01" step="0.01" id="amount" name="amount" className=" fs-5 form-control input-background numbers dm-text" value={this.state.amount} onChange={this.handleChange} required></input>
          </div>
          <div className="mx-1">
            <label className="raleway dm-text fs-4" htmlFor="date">Entry Date:</label>
            <input type="date" id="date" className="raleway dm-text" name="entry-date" value={this.state.date} onChange={this.handleChange} min="2020-01-01" required></input>
          </div>
        </div>
        <div className="form-group input-group my-4">
          <label htmlFor="note" className="form-label raleway dm-text fs-3 mx-4">Notes:</label>
          <input placeholder="Add a note..." className="form-control mx-4 input-background border border-4 rounded-pill border-dark dm-text fs-4 raleway" id="note" name="note" onChange={this.handleChange} required></input>
        </div>
        <div className="form-group input-group my-4">
          <label htmlFor="category" className="form-label raleway dm-text fs-3 mx-4">Categories:</label>
          <select className="form-select cat input-background raleway fs-5 dm-text border border-4 rounded-pill border-dark" id="categories" onChange={this.handleChange} required>
              <option className="raleway fs-5 dm-text" defaultValue='Choose a category...' selected disabled>Choose a category...</option>
            {
              (!categories.length)
                ? '...'
                : categories.filter(cat => (cat.categoryId !== 9)).map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId} id={cat.catName} className="category-name">{cat.catName}</option>
                ))
            }
          </select>
        </div>
        <div className="form-group input-group my-4">
          {renderPlaces}
        </div>
        <div className="flex justify-content-center my-4">
          <button type="submit" className="btn btn-dark">Save</button>
        </div>
      </form>
      );

    }
  }
}
