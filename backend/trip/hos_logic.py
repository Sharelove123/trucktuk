import math
from datetime import datetime, timedelta

def calculate_trip_hos(start_location, pickup_location, dropoff_location, current_cycle_used, distance_miles, duration_hours):
    """
    Simulates a trip based on HOS rules.
    Returns a list of events and logs.
    """
    events = []
    current_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    
    # Statuses: OFF (1), SLEEPER (2), DRIVING (3), ON_DUTY (4)
    
    # 1. Drive to Pickup
    # (For simplicity, we'll assume the provided duration_hours is the total driving time for the whole trip)
    # Actually, we should split it. Let's assume duration_hours is total.
    
    driving_time_left = duration_hours
    total_distance_covered = 0
    
    # State tracking
    daily_driving = 0
    daily_on_duty = 0
    shift_start_time = current_time
    last_break_time = current_time
    cumulative_cycle = current_cycle_used
    
    # Initial On Duty for Pickup (1 hour)
    events.append({
        'status': 4,
        'start': current_time,
        'duration': 1,
        'label': 'Pickup'
    })
    current_time += timedelta(hours=1)
    daily_on_duty += 1
    cumulative_cycle += 1
    
    while driving_time_left > 0:
        # Check limits
        drive_available = 11 - daily_driving
        shift_available = 14 - (current_time - shift_start_time).total_seconds() / 3600
        break_needed_in = 8 - (current_time - last_break_time).total_seconds() / 3600
        cycle_available = 70 - cumulative_cycle
        
        can_drive = min(drive_available, shift_available, break_needed_in, cycle_available, driving_time_left)
        
        if can_drive > 0:
            events.append({
                'status': 3,
                'start': current_time,
                'duration': can_drive,
                'label': 'Driving'
            })
            current_time += timedelta(hours=can_drive)
            driving_time_left -= can_drive
            daily_driving += can_drive
            cumulative_cycle += can_drive
            total_distance_covered += (can_drive / duration_hours) * distance_miles
            
            # Check for fueling (every 1000 miles)
            if total_distance_covered >= 1000:
                events.append({
                    'status': 4,
                    'start': current_time,
                    'duration': 0.25,
                    'label': 'Fueling'
                })
                current_time += timedelta(hours=0.25)
                cumulative_cycle += 0.25
                total_distance_covered -= 1000
        
        # Determine why we stopped driving and take appropriate break
        if driving_time_left <= 0:
            break
            
        if break_needed_in <= 0:
            events.append({
                'status': 1,
                'start': current_time,
                'duration': 0.5,
                'label': 'Rest Break'
            })
            current_time += timedelta(hours=0.5)
            last_break_time = current_time
            # Note: Rest break doesn't extend the 14-hour window
            
        elif drive_available <= 0 or shift_available <= 0:
            events.append({
                'status': 2,
                'start': current_time,
                'duration': 10,
                'label': 'Sleeper Berth'
            })
            current_time += timedelta(hours=10)
            daily_driving = 0
            daily_on_duty = 0
            shift_start_time = current_time
            last_break_time = current_time
            
        elif cycle_available <= 0:
            events.append({
                'status': 1,
                'start': current_time,
                'duration': 34,
                'label': '34h Restart'
            })
            current_time += timedelta(hours=34)
            cumulative_cycle = 0
            daily_driving = 0
            daily_on_duty = 0
            shift_start_time = current_time
            last_break_time = current_time

    # Final On Duty for Dropoff (1 hour)
    events.append({
        'status': 4,
        'start': current_time,
        'duration': 1,
        'label': 'Dropoff'
    })
    current_time += timedelta(hours=1)

    return events

def split_events_into_days(events):
    """
    Splits a continuous list of events into 24-hour log sheets starting from 00:00.
    """
    if not events:
        return []
        
    start_time = events[0]['start'].replace(hour=0, minute=0, second=0, microsecond=0)
    days = []
    current_day_events = []
    day_limit = start_time + timedelta(days=1)
    
    for event in events:
        event_start = event['start']
        event_end = event_start + timedelta(hours=event['duration'])
        
        while event_start < event_end:
            # If event crosses day boundary
            chunk_end = min(event_end, day_limit)
            duration = (chunk_end - event_start).total_seconds() / 3600
            
            current_day_events.append({
                'status': event['status'],
                'start_time': event_start.strftime('%H:%M'),
                'duration': duration,
                'label': event['label'],
                'start_hour': event_start.hour + event_start.minute/60.0
            })
            
            if chunk_end == day_limit:
                days.append(current_day_events)
                current_day_events = []
                day_limit += timedelta(days=1)
            
            event_start = chunk_end
            
    if current_day_events:
        # Fill the rest of the last day with OFF duty if needed
        last_event_end = event_start
        if last_event_end < day_limit:
             current_day_events.append({
                'status': 1,
                'start_time': last_event_end.strftime('%H:%M'),
                'duration': (day_limit - last_event_end).total_seconds() / 3600,
                'label': 'End of Trip',
                'start_hour': last_event_end.hour + last_event_end.minute/60.0
            })
        days.append(current_day_events)
        
    return days
