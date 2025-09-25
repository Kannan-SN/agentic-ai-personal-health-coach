from datetime import datetime, timedelta

def parse_timespan(span: str) -> timedelta:
    """
    Parse a string representing a time span and return a timedelta object.
    Useful for workout durations, meal prep times, etc.
    """
    try:
        value, unit = span[:-1], span[-1]
        value = int(value)
        if unit.lower() == "d":
            return timedelta(days=value)
        elif unit.lower() == "h":
            return timedelta(hours=value)
        elif unit == "m":
            return timedelta(minutes=value)
        elif unit.lower() == "s":
            return timedelta(seconds=value)
        elif unit.lower() == "ms":
            return timedelta(milliseconds=value)
        elif unit == "M":
            return timedelta(days=value * 30)
        elif unit.lower() == "y":
            return timedelta(days=value * 365)
        else:
            raise ValueError("Invalid time span format")
    except ValueError:
        raise ValueError("Invalid time span format")

def format_duration_human_readable(minutes: int) -> str:
    """
    Convert minutes to human readable format for workout durations
    """
    if minutes < 60:
        return f"{minutes} minutes"
    else:
        hours = minutes // 60
        remaining_minutes = minutes % 60
        if remaining_minutes == 0:
            return f"{hours} hour{'s' if hours > 1 else ''}"
        else:
            return f"{hours} hour{'s' if hours > 1 else ''} and {remaining_minutes} minutes"