#include <metal_stdlib>
using namespace metal;

// Overlay del mirino: focus peaking (Sobel sulla luminanza) e zebra sulle alte luci.
// Disegna solo dove serve; il resto resta trasparente sopra la preview.

struct OverlayVertexOut {
    float4 position [[position]];
    float2 uv;
};

struct OverlayParams {
    float4 peakingColor;     // premoltiplicato in shader
    float peakingThreshold;
    float zebraThreshold;
    float time;
    uint flags;              // bit 0 = peaking, bit 1 = zebra
};

vertex OverlayVertexOut irisOverlayVertex(uint vid [[vertex_id]]) {
    const float2 positions[4] = { float2(-1, -1), float2(1, -1), float2(-1, 1), float2(1, 1) };
    const float2 uvs[4] = { float2(0, 1), float2(1, 1), float2(0, 0), float2(1, 0) };
    OverlayVertexOut out;
    out.position = float4(positions[vid], 0, 1);
    out.uv = uvs[vid];
    return out;
}

static inline float luma(texture2d<float> tex, sampler s, float2 uv) {
    return dot(tex.sample(s, uv).rgb, float3(0.2126, 0.7152, 0.0722));
}

fragment float4 irisOverlayFragment(OverlayVertexOut in [[stage_in]],
                                    texture2d<float> frame [[texture(0)]],
                                    constant OverlayParams &params [[buffer(0)]]) {
    constexpr sampler s(address::clamp_to_edge, filter::linear);
    float2 texel = 1.5 / float2(frame.get_width(), frame.get_height());
    float4 color = float4(0.0);

    float center = luma(frame, s, in.uv);

    if ((params.flags & 2u) != 0u && center >= params.zebraThreshold) {
        float stripe = fmod(in.position.x + in.position.y + params.time * 30.0, 14.0);
        color = stripe < 7.0 ? float4(0.55, 0.55, 0.55, 0.55) : float4(0.0, 0.0, 0.0, 0.3);
    }

    if ((params.flags & 1u) != 0u) {
        float tl = luma(frame, s, in.uv + texel * float2(-1, -1));
        float tc = luma(frame, s, in.uv + texel * float2( 0, -1));
        float tr = luma(frame, s, in.uv + texel * float2( 1, -1));
        float ml = luma(frame, s, in.uv + texel * float2(-1,  0));
        float mr = luma(frame, s, in.uv + texel * float2( 1,  0));
        float bl = luma(frame, s, in.uv + texel * float2(-1,  1));
        float bc = luma(frame, s, in.uv + texel * float2( 0,  1));
        float br = luma(frame, s, in.uv + texel * float2( 1,  1));
        float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
        float gy = (bl + 2.0 * bc + br) - (tl + 2.0 * tc + tr);
        float magnitude = sqrt(gx * gx + gy * gy);
        if (magnitude > params.peakingThreshold) {
            float a = params.peakingColor.a * smoothstep(params.peakingThreshold, params.peakingThreshold * 1.6, magnitude);
            color = float4(params.peakingColor.rgb * a, a);
        }
    }
    return color;
}
