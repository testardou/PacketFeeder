FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .
COPY backend/ ./backend/
COPY core/ ./core/

ENV PCAPS_ROOT=/app/pcaps
ENV SCENARIOS_ROOT=/app/scenarios

EXPOSE 5000

CMD ["python3", "server.py"]
