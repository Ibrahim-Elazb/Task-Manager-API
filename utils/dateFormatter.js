const dateTimeFornmatter=(date,onlyDate=false)=>{
    const dateTime = new Date(date);
    const formattedDateTime = dateTime.toLocaleString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });

        return formattedDateTime;
}

module.exports = { dateTimeFornmatter }