package com.dao.courseservice.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Response;
import feign.codec.Decoder;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class FeignApiResponseDecoder implements Decoder {

    private final ObjectMapper mapper;

    public FeignApiResponseDecoder(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public Object decode(Response response, Type type) {
        try {
            if (response.body() == null) return null;

            JsonNode root = mapper.readTree(response.body().asReader(response.charset()));
            JsonNode data = root.get("data");

            if (data == null) {
                return mapper.readValue(root.traverse(), mapper.constructType(type));
            }

            if (data.isArray()) {
                Class<?> elementClass = getElementClass(type);
                List<Object> result = new ArrayList<>();
                for (JsonNode item : data) {
                    result.add(mapper.treeToValue(item, elementClass));
                }
                return result;
            } else {
                return mapper.treeToValue(data, mapper.constructType(type));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode Feign response: " + e.getMessage(), e);
        }
    }

    private Class<?> getElementClass(Type type) {
        if (type instanceof ParameterizedType) {
            Type[] args = ((ParameterizedType) type).getActualTypeArguments();
            if (args.length == 1 && args[0] instanceof Class) {
                return (Class<?>) args[0];
            }
            if (args.length == 1 && args[0] instanceof ParameterizedType) {
                return (Class<?>) ((ParameterizedType) args[0]).getRawType();
            }
        }
        return Object.class;
    }
}
